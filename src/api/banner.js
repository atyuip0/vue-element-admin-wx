import request from '@/utils/request'

export function bannerList(data) {
  return request({
    url: '/banner/list',
    method: 'post',
    data
  })
}

export function modifyBannerStatus(data) {
  return request({
    url: '/banner/modifyStatus',
    method: 'get',
    params:data
  })
}

export function addBanner(data) {
  return request({
    url: '/banner/create',
    method: 'post',
    data
  })
}

export function upBanner(data) {
  return request({
    url: '/banner/edit',
    method: 'post',
    data
  })
}
