//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const day = date.getDate(); // Define day here

mongoose.connect("mongodb+srv://admin-abdulhaadi:haadi0303@atlascluster.uflmigm.mongodb.net/todolistDB", {useNewUrlParser: true})
  .then(() => {  console.log('Connected to MongoDB');  })
  .catch(err => {  console.error('Error connecting to MongoDB:', err); });

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name:"Welcome to To-DO-List App"
}); const item2 = new Item({
  name:"To Add,click on +"
}); const item3 = new Item({
  name:"To Delete,Simply check it "
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", async function (req, res) {
 
  const foundItems = await Item.find({});
 
  if (!(await Item.exists())) {
    await Item.insertMany(defaultItems);
    res.redirect("/");
  } else {
    res.render("list", { listTitle: day, newListItems: foundItems });
  }
});
 


app.get("/:customListName", function (req, res) {
  //console.log(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);
 
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
 
  if (listName === day) {
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



app.post("/delete", async function(req, res){
  const checkedItemId = req.body.checkbox.trim();
  const listName = req.body.listName;

  if(listName === day){

  if (mongoose.isValidObjectId(checkedItemId)) {
    await Item.findByIdAndRemove(checkedItemId)
      .then(() => console.log(`Deleted ${checkedItemId} Successfully`))
      .catch((err) => console.log("Deletion Error: " + err));
  } else {
    console.log("Invalid ObjectId");
  }
  res.redirect("/");
}else {
  List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
    .then(() => {
      res.redirect("/" + listName);
    })
    .catch((err) => {
      console.log("Update Error: " + err);
      res.redirect("/");
    });
}
});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
