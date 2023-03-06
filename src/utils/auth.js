import Cookies from 'js-cookie'
import Config from '@/settings'

const TokenKey = Config.TokenKey
const PlatformKey = Config.PlatformKey
export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token, rememberMe) {
  if (rememberMe) {
    return Cookies.set(TokenKey, token, { expires: Config.tokenCookieExpires })
  } else return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getPlatform(){
  return Cookies.get(PlatformKey)
}

export function setPlatform(val){
  return Cookies.set(PlatformKey,val)
}
