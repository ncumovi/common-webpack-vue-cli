import request from '@/utils/request'

//组织
export function getApartTree(data) {
    return request({
        url: "/movi-service/organization",
        method: 'get',
        params: data
    })
}