import request from '@/utils/request'

export function uploadImg() {
  return request({
    url: '/uploadImg.ajax',
    method: 'post'
  })
}
