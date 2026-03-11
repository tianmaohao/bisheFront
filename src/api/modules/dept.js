// src/api/modules/dept.js
import request from '../index'

export const deptApi = {
    // 获取所有部门列表
    getAllDepts() {
        return request({
            url: '/api/dept/all',
            method: 'get'
        })
    },

    // 获取部门分页列表
    getDeptList(data) {
        return request({
            url: '/api/dept/list',
            method: 'post',
            data
        })
    },

    // 获取部门详情
    getDept(deptId) {
        return request({
            url: '/api/dept/get',
            method: 'get',
            params: {deptId}
        })
    },

    // 新增或更新部门
    addOrUpdateDept(data) {
        return request({
            url: '/api/dept/addOrUpdate',
            method: 'post',
            data
        })
    },

    // 删除部门
    deleteDept(deptId) {
        return request({
            url: '/api/dept/delete',
            method: 'delete',
            params: {deptId}
        })
    }
}
