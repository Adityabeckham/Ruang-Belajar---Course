const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Hello from Express JS Backend!"
    });
});

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});