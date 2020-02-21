const readFile = require('../lib/readFile'),
	express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	router = express.Router(),
	jsonpath = path.join(__dirname, '..', 'data')

console.log(__dirname)

const dataJobsList = require('../data/jobs.list.json'),
	dataJobsFilters = require('../data/jobs.filters.json')

const convertNaN = value => (!isNaN(value) ? +value : value),
	sortByDate = (a, b) => new Date(b.publishedDate) - new Date(a.publishedDate),
	convertPropertyTypeToArray = (object, key) => {
		if (object.hasOwnProperty(key) && !Array.isArray(object[key])) {
			object[key] = [convertNaN(object[key])]
		}
		return object
	},
	uniqueTagsFromItems = items => {
		let tags = []
		items.forEach(item => tags.push(...item.tags))

		return tags.filter((value, index, self) => self.indexOf(value) === index)
	},
	returnFilteredData = (query, files) => {
		const { dataFilter, dataList } = files

		query = convertPropertyTypeToArray(query, 'filter')

		const sortedByDate = dataList.sort(sortByDate)

		const mustContain = []
		dataFilter.forEach(item => {
			const slug = convertNaN(item.value)
			if (query.hasOwnProperty(slug) && query[slug])
				mustContain.push(query[slug])
		})

		if (query.hasOwnProperty('filter')) {
			if (Array.isArray(query.filter)) {
				mustContain.push(...query.filter)
			} else {
				mustContain.push(query.filter)
			}
		}
		// if(query.hasOwnProperty('filter') && !Array.isArray(query.filter)) mustContain.push(query.filter)

		const filteredItems = sortedByDate.filter(item => {
			let found = true
			mustContain.forEach(n => {
				found *= item.tags.indexOf(convertNaN(n)) > -1
			})
			return Boolean(found)
		})
		let pageOffset = convertNaN(query.offset) || 0,
			pageLimit = convertNaN(query.limit) || 6,
			length = filteredItems.length,
			pageCurrent = Math.floor(pageOffset / pageLimit) + 1,
			pageTotal = Math.ceil(length / pageLimit),
			prevOffset =
				pageCurrent > 1
					? { offset: pageOffset - pageLimit, limit: pageLimit }
					: pageOffset > 0 && pageOffset < pageLimit
					? { offset: 0, limit: pageLimit }
					: null,
			nextOffset =
				pageCurrent < pageTotal
					? { offset: pageOffset + pageLimit, limit: pageLimit }
					: null,
			list = [...filteredItems].splice(pageOffset, pageLimit),
			nextQuery = {}

		delete query.offset
		delete query.limit

		const data = {
			filters: dataFilter,
			page: {
				itemTotal: length,
				itemLength: list.length,
				pageOffset,
				pageLimit,
				pageCurrent,
				pageTotal,
				pageQuery: query,
				pagePrevQuery: prevOffset ? { ...query, ...prevOffset } : null,
				pageNextQuery: nextOffset ? { ...query, ...nextOffset } : null,
				tagsUnique: uniqueTagsFromItems(filteredItems)
			},
			list
		}
		switch (query.listtype) {
			case 'listonly':
				return list
				break
			case 'all':
				return sortedByDate
				break
			default:
				return data
		}
	},
	queryFilterFiles = ({ label, query }) => {
		const filtersFile = path.join(jsonpath, `${label}.filters.json`),
			listFile = path.join(jsonpath, `${label}.list.json`)

		return Promise.all([readFile(filtersFile), readFile(listFile)])
			.then(values => ({
				dataFilter: JSON.parse(values[0]),
				dataList: JSON.parse(values[1])
			}))
			.then(returnFilteredData.bind(null, query))
	},
	listId = label => (req, res, next) => {
		const listFile = path.join(jsonpath, `${label}.list.json`)

		return Promise.resolve(readFile(listFile))
			.then(data => JSON.parse(data))
			.then(dataList => {
				const { id } = req.params
				return {
					item: dataList.find(item => item.id == id) || {}
				}
			})
			.then(res.json.bind(res))
	},
	listAll = label => (req, res, next) => {
		const listFile = path.join(jsonpath, `${label}.list.json`)

		return Promise.resolve(readFile(listFile))
			.then(list => ({ list: JSON.parse(list) }))
			.then(res.json.bind(res))
	},
	listFilteredAll = label => (req, res, next) => {
		const query = { ...req.query, ...req.body }
		console.log(JSON.stringify({ query }))

		return Promise.resolve(queryFilterFiles({ label, query })).then(
			res.json.bind(res)
		)
	}

router.use(bodyParser.json())
/* GET home page. */
router.get('/', function(req, res, next) {
	res.send('Valtech API')
})

router.all('/log', (req, res, next) => {
	const query = { ...req.query, ...req.body }
	res.json(query)
})

router.get('/v1/i18n', (req, res, next) => {
	const filePath = path.join(jsonpath, 'valtech.i18n.json')

	return Promise.resolve(readFile(filePath))
		.then(i18n => ({ i18n: JSON.parse(i18n) }))
		.then(res.json.bind(res))
})

router
	.get('/v1/insights/id/:id', listId('insights'))
	.use('/v1/insights', (req, res, next) => {
		let query = req.query

		if (!query.hasOwnProperty('limit')) {
		}

		if (
			!query.hasOwnProperty('offset') ||
			(query.hasOwnProperty('offset') &&
				!isNaN(query.offset) &&
				query.offset == 0)
		) {
			query = { ...query, ...{ limit: 13 } }
		} else {
			query = { ...query, ...{ limit: 6 } }
		}

		return Promise.resolve(queryFilterFiles({ label: 'insights', query })).then(
			res.json.bind(res)
		)
	})

router
	.all('/v1/whitepapers/id/:id', listId('whitepapers'))
	.all('/v1/whitepapers', listFilteredAll('whitepapers'))
	.all('/v1/cases/id/:id', listId('cases'))
	.all('/v1/cases', listFilteredAll('cases'))
	.all('/v1/jobs/id/:id', listId('jobs'))
	.all('/v1/jobs', listFilteredAll('jobs'))

router
	.get('/v1/contacts/id/:id', listId('offices'))
	.all('/v1/contacts', listAll('offices'))

module.exports = router
