const
  readFile = require('../lib/readFile'),
  express = require('express'),
  path = require('path'),
  router = express.Router(),
  jsonpath = path.join(__dirname, '..', 'data')

console.log(__dirname)

const 
  dataJobsList = require('../data/jobs.list.json'),
	dataJobsFilters = require('../data/jobs.filters.json')
	

const
	sortByDate = (a, b) => new Date(b.publishAt) - new Date(a.publishAt),
	
	uniqueTagsFromItems = (items) => {
		let tags = []
		items.forEach(item => tags.push(...item.tags))

		return tags
		.filter((value, index, self) => self.indexOf(value) === index)
  },
  
  returnFilteredData = (query, files) => {
    const { dataFilter, dataList } = files

    const
      sortedByDate = dataList.sort(sortByDate)

    const mustContain = []
    dataFilter.forEach(item => {
      const slug = item.value
      if (query.hasOwnProperty(slug)) mustContain.push(query[slug])
    })
    if(query.hasOwnProperty('filter') && Array.isArray(query.filter)) mustContain.push(...query.filter)

    const filteredItems = sortedByDate.filter(item => {
      let found = true
      mustContain.forEach(n => {
        found *= item.tags.indexOf(!isNaN(+n) ? +n : n) > -1
      })
      return Boolean(found)
    })
    let pageOffset = !isNaN(query.offset) && +query.offset || 0, 
      pageLimit = !isNaN(query.limit) && +query.limit || 6,
      length = filteredItems.length,
      pageCurrent = Math.floor(pageOffset / pageLimit) + 1,
      pageTotal = Math.ceil(length / pageLimit),
      prevOffset = pageCurrent > 1 ? { offset: pageOffset - pageLimit, limit: pageLimit } : pageOffset > 0 && pageOffset < pageLimit ? { offset: 0, limit: pageLimit } : null,
      nextOffset = pageCurrent < pageTotal ? { offset: pageOffset + pageLimit, limit: pageLimit } : null,
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
        pagePrevQuery: prevOffset ? {...query, ...prevOffset} : null,
        pageNextQuery: nextOffset ? {...query, ...nextOffset} : null,
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
  }

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Valtech API')
})

router.get('/v1/cases', (req, res, next) => {
  const query = req.query

  const 
    filtersFile = path.join(jsonpath, 'cases.filters.json'),
    listFile = path.join(jsonpath, 'cases.list.json')

  return Promise.all([readFile(filtersFile), readFile(listFile)])
  .then(values => ({
    dataFilter: JSON.parse(values[0]),
    dataList: JSON.parse(values[1])
  }))
  .then(returnFilteredData.bind(null, query))
  .then(res.json.bind(res))
})

router.use('/v1/jobs', (req, res, next) => {
  const 
    filtersFile = path.join(jsonpath, 'jobs.filters.json'),
    listFile = path.join(jsonpath, 'jobs.list.json')

  return Promise.all([readFile(filtersFile), readFile(listFile)])
  .then(values => ({
    filters: JSON.parse(values[0]),
    list: JSON.parse(values[1])
  }))
  .then(res.json.bind(res))
})

module.exports = router