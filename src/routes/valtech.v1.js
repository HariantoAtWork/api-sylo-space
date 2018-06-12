const
  readFile = require('../lib/readFile'),
  express = require('express'),
  bodyParser = require('body-parser'),
  path = require('path'),
  router = express.Router(),
  jsonpath = path.join(__dirname, '..', 'data')

console.log(__dirname)

const
  dataJobsList = require('../data/jobs.list.json'),
	dataJobsFilters = require('../data/jobs.filters.json')


const
  convertNaN = (value) => !isNaN(value) ? +value : value,

  sortByDate = (a, b) => new Date(b.publishedDate) - new Date(a.publishedDate),
  
  convertPropertyTypeToArray = (object, key) => {
    if (object.hasOwnProperty(key) && !Array.isArray(object[key])) {
      object[key] = [convertNaN(object[key])]
    }
    return object
  },

	uniqueTagsFromItems = (items) => {
		let tags = []
		items.forEach(item => tags.push(...item.tags))

		return tags
		.filter((value, index, self) => self.indexOf(value) === index)
  },

  returnFilteredData = (query, files) => {
    const { dataFilter, dataList } = files

    query = convertPropertyTypeToArray(query, 'filter')
    
    const
      sortedByDate = dataList.sort(sortByDate)

    const mustContain = []
    dataFilter.forEach(item => {
      const slug = convertNaN(item.value)
      if (query.hasOwnProperty(slug) && query[slug]) mustContain.push(query[slug])
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
        pageQuery: query,
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

router.use(bodyParser.json())
/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Valtech API')
})

router.all('/v1/whitepapers', (req, res, next) => {
  const query = {...req.query, ...req.body}
  console.log(JSON.stringify(query))

  const
    filtersFile = path.join(jsonpath, 'whitepapers.filters.json'),
    listFile = path.join(jsonpath, 'whitepapers.list.json')

  return Promise.all([readFile(filtersFile), readFile(listFile)])
  .then(values => ({
    dataFilter: JSON.parse(values[0]),
    dataList: JSON.parse(values[1])
  }))
  .then(returnFilteredData.bind(null, query))
  // .then(json => {console.log(json); return json})
  .then(res.json.bind(res))
})

router.use('/v1/insights', (req, res, next) => {
  let query = req.query

  if (!query.hasOwnProperty('limit')) {

  }
  if (!query.hasOwnProperty('offset')
  || query.hasOwnProperty('offset') 
  && !isNaN(query.offset)
  && (query.offset == 0)) {
    query = {...query, ...{
      limit: 13
    }}
  } else {
    query = {...query, ...{
      limit: 6
    }}
  }

  
  const
    filtersFile = path.join(jsonpath, 'insights.filters.json'),
    listFile = path.join(jsonpath, 'insights.list.json')

  return Promise.all([readFile(filtersFile), readFile(listFile)])
  .then(values => ({
    dataFilter: JSON.parse(values[0]),
    dataList: JSON.parse(values[1])
  }))
  .then(returnFilteredData.bind(null, query))
  .then(res.json.bind(res))
})

router.all('/v1/cases', (req, res, next) => {
  const query = {...req.query, ...req.body}
  console.log(JSON.stringify(query))

  const
    filtersFile = path.join(jsonpath, 'cases.filters.json'),
    listFile = path.join(jsonpath, 'cases.list.json')

  return Promise.all([readFile(filtersFile), readFile(listFile)])
  .then(values => ({
    dataFilter: JSON.parse(values[0]),
    dataList: JSON.parse(values[1])
  }))
  .then(returnFilteredData.bind(null, query))
  // .then(json => {console.log(json); return json})
  .then(res.json.bind(res))
})

router.all('/v1/jobs', (req, res, next) => {
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