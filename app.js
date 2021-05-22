//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const app = express();
mongoose.connect("mongodb+srv://admin-shrey:Shrey@1616@cluster0.lm3al.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemSchema);
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("List", listSchema);

const buy = new Item({
  name: "Welcome to your todolist",

});
const cook = new Item({
  name: "hit the + button to add a new item",

});
const eat = new Item({
  name: "<-- hit this to delete an item",

});
const defaultitems = [buy, cook, eat];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const workItems = [];



app.get("/", function(req, res) {

  Item.find({}, function(err, founditems) {
    if (founditems.length === 0) {
      Item.insertMany(defaultitems, function(err) {
        if (err) {
          console.log("fail");
        } else
          console.log("successfully inserted");
      })
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "today",
        newListItems: founditems
      });
    }


  });

});

app.post("/", function(req, res) {

  const itemname = req.body.newItem;
  const listname = req.body.list;
  const item = new Item({
    name: itemname
  });
  if (listname === "today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listname
    }, function(err, foundlist) {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listname);
    })
  }



});

app.post("/delete", function(req, res) {
  const checkeditemid = req.body.checkbox;
  const listname = req.body.listname;
  if (listname === "today") {
    Item.findByIdAndRemove(checkeditemid, function(err) {
      if (!err) {
        console.log("successfullyremoved");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({
      name: listname
    }, {
      $pull: {
        items: {
          _id: checkeditemid
        }
      }
    }, function(err, foundlist) {
      if (!err) {
        res.redirect("/" + listname);
      }
    })
  }




})
app.get("/:work", function(req, res) {
  const store = _.capitalize(req.params.work);
  List.findOne({
    name: store
  }, function(err, foundlist) {
    if (!err) {
      if (!foundlist) {
        // create a new list
        const firstlist = new List({
          name: store,
          items: defaultitems

        });
        firstlist.save();
        res.redirect("/" + store);
      } else {
        // show an exsiting list
        res.render("list", {
          listTitle: foundlist.name,
          newListItems: foundlist.items
        })

      }
    }
  })


});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT|| 3000, function() {
  console.log("Server started on port");
});
