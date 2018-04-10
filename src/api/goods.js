import request from '@/utils/request'

export function goodsList(data) {
  return request({
    url: '/goods/list',
    method: 'post',
    data
  })
}

export function addGoods(data) {
  return request({
    url: '/goods/add',
    method: 'post',
    data
  })
}

export function upGoods(data) {
  return request({
    url: '/goods/update',
    method: 'post',
    data
  })
}
