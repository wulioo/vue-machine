import request from '@/utils/request'
import {getPlatform} from '@/utils/auth'
export function getMenusTree(pid) {
  return request({
    url: 'system/menus/lazy/?pid=' + pid,
    method: 'get'
  })
}

export function getMenus(params) {

  return request({
    url: 'system/menus/',
    method: 'get',
    params
  })
}

export function getMenuSuperior(ids) {
  const data = Array.isArray(ids) || ids.length === 0 ? ids : Array.of(ids)
  return request({
    url: 'system/menus/superior/',
    method: 'get',
    data
  })
}

export function getChild(id) {
  return request({
    url: 'system/menus/child/' + id + '/',
    method: 'get'
  })
}

export function buildMenus() {
  let platform = getPlatform()
  let params = {type:platform}

  return request({
    url: 'system/menus/build/?platform=' +platform,
    method: 'get',
    // params
  })
}

export function add(data) {
  return request({
    url: 'system/menus/',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'system/menus/' + ids + '/',
    method: 'delete',
    // data: {'menu_id':ids}
  })
}

export function edit(data) {
  return request({
    url: 'system/menus/' + data['id'] + '/',
    method: 'put',
    data
  })
}

export default {add, edit, del, getMenusTree, getMenuSuperior, getMenus, getChild}
