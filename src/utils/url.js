/* 获取url 参数对应的值 */
export function getQueryString(name){
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i")
  let r = location.hash.substring(location.hash.indexOf('?')+1).match(reg)
  return r[2]
}
