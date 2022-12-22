const express = require("express")
const twilio = require("twilio")
const mongo = require("mongodb")
const dotenv = require("dotenv")
const bodyParser = require("body-parser")

dotenv.config()

const db = require("./db")

const PORT = process.env.PORT || 3000

const accountSid = process.env.TWILIO_SID
const authToken = process.env.TWILIO_KEY
const client = twilio(accountSid, authToken)

const macRegex = /^[a-fA-F0-9]{2}(:[a-fA-F0-9]{2}){5}$/gm

function sendTwilioMessage(phoneNumber) {
	client.messages
		.create({
			body: "*ALERT!* Sensor has detected gas leakage at your home. Please check your cylinder or call emergency services at 112 if necessary.",
			messagingServiceSid: "MGc8865098a082855b37045087d9e652f3",
			to: `${phoneNumber}`,
		})
		.then((message) =>
			console.log("Message sent to ", phoneNumber, " SID ", message.sid)
		)
		.done()
}

const app = express()

app.use(bodyParser.json())

app.post("/leak", (req, res) => {
	console.log("LEAK DETECTED")

	const { mac } = req.body

	if (!macRegex.test(mac)) {
		res.sendStatus(422)
		return
	}

	const phone = db.getPhoneNumber(mac)

	if (phone != "") {
		sendTwilioMessage(phone)
		res.send(200)
		return
	}

	res.send(500)
})

app.get("/", (_, res) => res.send("<h2>Server running</h2>"))

// const client = new mongo.MongoClient(process.env.MONGO_URL)

async function main() {
	app.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`)
	})
}

main()
