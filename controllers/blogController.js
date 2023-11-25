const controller = {};
const models = require("../models");
const Sequelize = require("sequelize"); 
const Op = Sequelize.Op;
const limit = 2;
const loadBlogs = datas => datas.map(data => data.dataValues);

controller.showList = async (req, res) => {

	res.locals.categories = await models.Category.findAll({
		attributes: ["id", "name"],
		include: [
			{ model: models.Blog},
		]
	});
	res.locals.tags = await models.Tag.findAll({
		attributes: ["id", "name"],
	});

	let category = req.query.category;
	let tag = req.query.tag;
	let search = req.query.search;
	let page = Number(req.query.page) || 1;

	if (category) {
		let { count, rows: blogs } = await models.Blog.findAndCountAll({
			limit: limit,
			offset: (page - 1) * limit,
			attributes: 
			[	"id", "title", "imagePath", "summary", "createdAt",
				[
					models.Sequelize.literal(
						'(SELECT COUNT(*) FROM "Comments" WHERE "Comments"."blogId" = "Blog"."id")'
						),
						"comments",
				],
			],
			where: { categoryId: category },
		});
		res.render(
			"index", 
			{ 
				blogs: loadBlogs(blogs),
				pagination: {
					page: page,
					limit: limit,
					totalRows: count,
					queryParams: { category: category }, 
				}
			});
	} 
	else if (tag) {
		let { count, rows: blogs } = await models.Blog.findAndCountAll({
			limit: limit,
			offset: (page - 1) * limit,
			attributes: 
			[	"id", "title", "imagePath", "summary", "createdAt",
				[
					models.Sequelize.literal(
						'(SELECT COUNT(*) FROM "Comments" WHERE "Comments"."blogId" = "Blog"."id")'
						),
						"comments",
				],
			],
			include: [
				{
					model: models.Tag,
					where: { id: tag },
				}
			]
		});
		res.render(
			"index", 
			{ 
				blogs: loadBlogs(blogs),
				pagination: {
					page: page,
					limit: limit,
					totalRows: count, 
					queryParams: { tag: tag },
				}
			});
	}

	else if (search) {
		let { count, rows: blogs } = await models.Blog.findAndCountAll({
			limit: limit,
			offset: (page - 1) * limit,
			attributes: 
			[	"id", "title", "imagePath", "summary", "createdAt",
				[
					models.Sequelize.literal(
						'(SELECT COUNT(*) FROM "Comments" WHERE "Comments"."blogId" = "Blog"."id")'
						),
						"comments",
				],
			],
			where: { title: { [Op.iRegexp]: search }},
		});
		res.render(
			"index", 
			{ 
				blogs: loadBlogs(blogs),
				pagination: {
					page: page,
					limit: limit,
					totalRows: count,
					queryParams: { search: search }, 
				}
			});

	}
	else {
		let { count, rows: blogs} = await models.Blog.findAndCountAll({
			limit: limit,
			offset: (page - 1) * limit,
			attributes: 
			[	"id", "title", "imagePath", "summary", "createdAt",
				[
					models.Sequelize.literal(
						'(SELECT COUNT(*) FROM "Comments" WHERE "Comments"."blogId" = "Blog"."id")'
						),
						"comments",
				],
			],
		});
		res.render(
			"index", 
			{ 
				blogs: loadBlogs(blogs),
				pagination: {
					page: page,
					limit: limit,
					totalRows: count, 
				}
			});
	}
};

controller.showDetails = async (req, res) => {
	res.locals.categories = await models.Category.findAll({
		attributes: ["id", "name"],
		include: [
			{ model: models.Blog},
		]
	});
	res.locals.tags = await models.Tag.findAll({
		attributes: ["id", "name"],
	});
	
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

	res.locals.categories = await models.Category.findAll({
		attributes: ["id", "name"],
		include: [
			{ model: models.Blog},
		]
	});
	res.locals.tags = await models.Tag.findAll({
		attributes: ["id", "name"],
	});

	res.render("details");
};

module.exports = controller;