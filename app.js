var express = require("express");
var app = express();

app.set("views", "./");
app.set("view engine", "ejs");
app.use(express.static("./static"));

app.get("/", function(req, res) {

	res.render("home");
})

app.listen(3000, "localhost");
