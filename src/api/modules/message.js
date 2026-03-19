
// src/api/modules/message.js
import request from '../index'

export const messageApi = {
    // 获取未读消息
    getUnreadMessages() {
        return request({
            url: '/api/message/unread',
            method: 'get'
        })
    },

    // 分页获取消息列表
    getMessageList(data) {
        return request({
            url: '/api/message/list',
            method: 'post',
            data
        })
    },

    // 标记消息为已读
    markAsRead(msgId) {
        return request({
            url: `/api/message/${msgId}/read`,
            method: 'put'
        })
    },

    // 标记所有消息为已读
    markAllAsRead() {
        return request({
            url: '/api/message/read-all',
            method: 'put'
        })
    },

    // 获取消息统计（未读数量）
    getMessageStats() {
        return request({
            url: '/api/message/stats',
            method: 'get'
        })
    }
}
