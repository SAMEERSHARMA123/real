const mongoose = require('mongoose');
const dotenv = require("dotenv")
dotenv.config()
const url =  process.env.MONGO_URL

// const connection = mongoose.connect(url).then(() => console.log("✅ MongoDB connected"))
// .catch(err => console.log("❌ DB error:", err));

const connection = async () => {
    try {
        await mongoose.connect(url);
        console.log("MongoDB Connected Successfully");
    } catch (err) {
        console.error("Database Connection Error:", err);
        // Retry connection after delay
        console.log("Retrying connection in 5 seconds...");
        setTimeout(() => {
            connection();
        }, 5000);
    }
}
module.exports = connection
