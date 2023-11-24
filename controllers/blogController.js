const controller = {};
const models = require("../models");
const Sequelize = require("sequelize"); 
const Op = Sequelize.Op;

controller.showList = async (req, res) => {
	let category = req.query.category;
	let tag = req.query.tag;
	let search = req.query.search;
	if (category) {
		res.locals.blogs = await models.Blog.findAll({
			attributes: ["id", "title", "imagePath", "summary", "createdAt"],
			where: { categoryId: category },
			include: [
				{ model: models.Comment },		
			],
		})
	} 
	else if (tag) {
		let tagBlog = await models.Tag.findByPk(tag);
		res.locals.blogs = await tagBlog.getBlogs({
			attributes: ["id", "title", "imagePath", "summary", "createdAt"],
			include: [
				{ model: models.Comment },
			]
		})
	}

	else if (search) {
		res.locals.blogs = await models.Blog.findAll({
			attributes: ["id", "title", "imagePath", "summary", "createdAt"],
			where: { title: { [Op.iRegexp]: search }},
			include: [
				{ model: models.Comment },		
			],
		})
	}
	else {
		res.locals.blogs = await models.Blog.findAll({
			attributes: ["id", "title", "imagePath", "summary", "createdAt"],
			include: [
				{ model: models.Comment },		
			],
		})
	}
	
	res.locals.categories = await models.Category.findAll({
		attributes: ["id", "name"],
		include: [
			{ model: models.Blog},
		]
	}),
	res.locals.tags = await models.Tag.findAll({
		attributes: ["id", "name"],
	}),

	res.render("index");
};

controller.showDetails = async (req, res) => {
	let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
	res.locals.blog = await models.Blog.findOne({
		attributes: ["id", "title", "description", "createdAt", "imagePath"],
		where: { id: id },
		include: [
			{ model: models.Category },
			{ model: models.User },
			{ model: models.Tag },
			{ model: models.Comment },
		],
	})
	res.render("details");
};

module.exports = controller;