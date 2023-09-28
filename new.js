const express = require("express");
const mongoose = require("mongoose");
 
const app = express();
 
app.set('view engine', 'ejs');
 
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
 
// connecting with the database
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
}
 
const itemsSchema = new mongoose.Schema({
  name: String
});
 
const Item = mongoose.model("Item", itemsSchema);
 
const item1 = new Item({
  name: "Welcome to your todolist"
});
 
const item2 = new Item({
  name: "Click + to add a new task!"
});
 
const item3 = new Item({
  name: "Tick the box once the task is completed!"
});
 
const defaultItems = [item1, item2, item3];
 
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
 
const List = mongoose.model("List", listSchema);
 
app.get("/", async function (req, res) {
 
  const foundItems = await Item.find({});
 
  if (!(await Item.exists())) {
    await Item.insertMany(defaultItems);
    res.redirect("/");
  } else {
    res.render("list", { listTitle: "Today", newListItems: foundItems });
  }
});
 
app.get("/:customListName", function (req, res) {
 
  const customListName = req.params.customListName;
 
  List.findOne({ name: customListName })
    .then((foundList) => {
      if (foundList === null) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
 
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    })
    .catch((err) => {
      console.error(err);
    });
 
});
 
app.post("/", function (req, res) {
 
  const itemName = req.body.newItem;
  const listName = req.body.list;
 
  const item = new Item({
    name: itemName
  });
 
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.error(err);
      });
  }
});
 
app.post("/delete", function (req, res) {
 
  const checkedItemId = req.body.checkbox;
 
  Item.findByIdAndRemove(checkedItemId)
    .then(() => {
      console.log("Succesfully deleted checked item from the database");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});
 
app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});
 
app.get("/about", function (req, res) {
  res.render("about");
});
 
app.listen(4000, function () {
  console.log("Server started on port 4000");
});