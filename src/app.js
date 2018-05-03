const cors = require('cors')
const jsonServer = require('json-server')
const clone = require('clone')
const data = require('../data.json')
const dataJobsList = require('../data/jobs.list.json')
const dataJobsFilters = require('../data/jobs.filters.json')
const dataCasesList = require('../data/cases.list.json')
const dataCasesFilters = require('../data/cases.filters.json')
const sortByDate = (a, b) => new Date(b.publishAt) - new Date(a.publishAt)
const casesSortedByDate = dataCasesList.sort(sortByDate)
const app = jsonServer.create()
const router = jsonServer.router(clone(data))


app.use(cors())

app.get('/cases', (req, res, next) => {
  const query = req.query
  console.log(req.query)

  const mustContain = []
  dataCasesFilters.forEach(item => {
    const slug = item.value
    if (query.hasOwnProperty(slug)) mustContain.push(query[slug])
  })
  console.log(mustContain)
  const filteredItems = casesSortedByDate.filter(item => {
    let found = true
    mustContain.forEach(n => {
      found *= item.tags.indexOf(+n) > -1
    })
    return Boolean(found)
  })
  let pageOffset = !isNaN(query.offset) && +query.offset || 0, 
    pageLimit = !isNaN(query.limit) && +query.limit || 6,
    length = filteredItems.length,
    pageCurrent = Math.floor(pageOffset / pageLimit) + 1,
    pageTotal = Math.ceil(length / pageLimit),
    prevOffset = pageCurrent > 1 ? { offset: pageOffset - pageLimit, limit: pageLimit } : null,
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
      pageNextQuery: nextOffset ? {...query, ...nextOffset} : null
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

app.use('/jobs', (req, res, next) => {
  const data = {
    filters: dataJobsFilters,
    list: dataJobsList
  }

  res.json(data)
})

app.use((req, res, next) => {
  if (req.path === '/') return next()
  router.db.setState(clone(data))
  next()
})

app.use((req, res, next) => {
  if (req.path === '/') return next()
  router.db.setState(clone(data))
  next()
})

app.use(jsonServer.defaults({
  logger: process.env.NODE_ENV !== 'production'
}))

app.use(router)

module.exports = app
