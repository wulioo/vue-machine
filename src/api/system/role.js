import request from '@/utils/request'

// 获取所有的Role
export function getAll() {
  return request({
    url: 'api/roles/all',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: 'auth/roles/',
    method: 'post',
    data
  })
}

export function get(id) {
  return request({
    url: 'auth/roles/' + id + '/',
    method: 'get'
  })
}

export function getLevel() {
  return request({
    url: 'auth/roles/level/',
    method: 'get'
  })
}

export function del(ids) {
  return request({
    url: 'auth/roles/' + ids + '/',
    method: 'delete',
    // data: ids
  })
}

export function edit(data) {
  return request({
    url: 'auth/roles/' + data['id'] + '/',
    method: 'put',
    data
  })
}

export function editMenu(data) {
  return request({
    url: 'auth/roles/menu/',
    method: 'post',
    data
  })
}

export default { add, edit, del, get, editMenu, getLevel }
