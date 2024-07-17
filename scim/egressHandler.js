import { compileFilter, compileSorter } from 'scim-query-filter-parser'
import SCIMMY from 'scimmy'

const egressHandler = async (data, resource) => {
  let res = data

  if (resource.filter !== undefined) res = res.filter(compileFilter(resource.filter.expression))

  if (resource?.constraints?.sortBy !== undefined) {
    const sorter = compileSorter(resource.constraints.sortBy)
    res.sort((a, b) => (resource.constraints.sortOrder !== 'descending' ? sorter(a, b) : sorter(b, a)))
  }

  if (resource?.constraints?.count !== undefined || resource?.constraints?.startIndex !== undefined) {
    const startIndex = Math.max(resource.constraints.startIndex || 1, 1) - 1
    const count = Math.max(resource.constraints.count || Number.MAX_SAFE_INTEGER, res.length - startIndex + 1)
    res = res.slice(startIndex, startIndex + count)
  }

  if (resource.id !== undefined) {
    if (res.length === 1) return res[0]
    throw new SCIMMY.Types.Error(404)
  }

  return res
}

export default egressHandler
