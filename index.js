require('dotenv').config()
const {Bot, GrammyError, HttpError, Keyboard, InlineKeyboard} = require('grammy')
const fs = require('fs');

const imagesArray = JSON.parse(fs.readFileSync('gallery.json'));

const filterGallery = (type, array) => {
	const filteredArray = array.filter(item => {
		return item.type === type
	})

	return filteredArray
}

// const winterArray = filterGallery('winter', imagesArray)
// const summerArray = filterGallery('summer', imagesArray)



const bot = new Bot(process.env.BOT_API_KEY)

bot.api.setMyCommands([
	{
		command: 'start', 
		description: 'Запуск бота',
	},
	{
		command: 'help', 
		description: 'Помощь по боту',
	},
])

const startLabels = ['🌲 Дай леса! 🌲', 'Выбери настроение ➡️']
const startButtons = startLabels.map((label) => {
	return [
		Keyboard.text(label)
	]
})

const startKeyboard = Keyboard.from(startButtons).resized()



bot.command('start', async (ctx) => {
	await ctx.reply(`Здравствуй, ${ctx.from.username}! Нажми кнопку ${startLabels[0]} чтобы получить рандомную фотографию или выбери настроение из списка`, {
		reply_markup: startKeyboard
	})
})

bot.command('help', async (ctx) => {
	await ctx.reply('Помощь по боту')
})

const moodLabels = [
	[{text:'Летний лес', callback_data:'summer'}], 
	[{text:'Зимний лес', callback_data:'winter'}],
	[{text:'Осенний лес', callback_data:'autumn'}],
	[{text:'Межсезонье', callback_data:'spring'}],
	[{text:'Блэк-метал лес', callback_data:'dark'}]
]

const moodButtons = moodLabels.map((label) => {
	return [
		Keyboard.text(label.title)
	]
})

const moodKeyboard = InlineKeyboard.from(moodLabels)



// const moodKeyboard = new InlineKeyboard().text('Летний лес', 'summer').row().text('Зимний лес', 'winter').row().text('Осенний лес', 'autumn').row().text('Весенний лес', 'spring').row().text('Блэк-метал лес', 'dark')

console.log(moodKeyboard.inline_keyboard)

const repeatKeyboard = new InlineKeyboard().text('Повторить', 'repeat').row().text('Выбрать другое настроение', 'back')



bot.hears(startLabels[0], async (ctx) => {
	let randomIndex = Math.floor(Math.random() * imagesArray.length);
	await ctx.replyWithPhoto(imagesArray[randomIndex].url, {
		caption: "@wannaforest_bot"
	});
})

bot.hears([startLabels[1], 'Выбрать другое настроение'], async (ctx) => {
	await ctx.reply('Выбери настроение:', {
		reply_markup: moodKeyboard
	})
})

bot.on('callback_query:data', async (ctx) => {
		await ctx.answerCallbackQuery()

		const arrayType = filterGallery(ctx.callbackQuery.data, imagesArray)
		let randomIndex = Math.floor(Math.random() * arrayType.length)

		await ctx.replyWithPhoto(arrayType[randomIndex].url, {
			caption: "@wannaforest_bot"
		})

		await ctx.reply('Выбери настроение:', {
			reply_markup: moodKeyboard
		})

})

bot.catch((err) => {
	const ctx = err.ctx
	console.error(`Error while handing update ${ctx.update.update_id}:`)
	const e = err.error

	if(e instanceof GrammyError) {
		console.error("Error in request:", e.description)
	} else if (e instanceof HttpError) {
		console.error("Could not contact Telegram:", e)
	} else {
		console.error("Unknown error", e)
	}
})

bot.start()

