const
	express = require('express'),
	router = express.Router()

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
	}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Valtech API')
})

router.get('/v1/cases', (req, res, next) => {
  const
    dataCasesList = require('../data/cases.list.json'),
    dataCasesFilters = require('../data/cases.filters.json'),
    casesSortedByDate = dataCasesList.sort(sortByDate)

  const query = req.query
  console.log(req.query)

  const mustContain = []
  dataCasesFilters.forEach(item => {
    const slug = item.value
    if (query.hasOwnProperty(slug)) mustContain.push(query[slug])
  })
  if(query.hasOwnProperty('filter') && Array.isArray(query.filter)) mustContain.push(...query.filter)

  const filteredItems = casesSortedByDate.filter(item => {
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
    filters: dataCasesFilters,
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
      res.json(list)
      break
    case 'all':
      res.json(casesSortedByDate)
      break
    default:
      res.json(data)
  }
})

router.use('/v1/jobs', (req, res, next) => {
  const data = {
    filters: dataJobsFilters,
    list: dataJobsList
  }

  res.json(data)
})

module.exports = router