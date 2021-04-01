const state = {
  userId: 'hh',
}

const mutations = {
  //用户角色id
  SET_USERID: (state, userId) => {
    state.userId = userId
  },

}

const actions = {
  // user logout
  logout({
    commit,
    state,
    dispatch
  }) {
    return new Promise((resolve, reject) => {

      resolve()

    })
  },


}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}