var express = require("express");
var app = express();
var port = process.env.PORT || 3000

app.set("views", "./");
app.set("view engine", "ejs");
app.use(express.static("./static"));

app.get("/", function(req, res) {

	res.render("home");
})

app.listen(port);
