/*
* 面板公共方法及处理
* */
import { Button, Character, MysApi, Player } from '#miao.models'
import { miaoPath } from '#miao.path'

/*
* 获取面板查询的 目标uid
* */
const _getTargetUid = async function (e) {
  let uidReg = /(18|[1-9])[0-9]{8}/

  if (e.uid && uidReg.test(e.uid)) {
    return e.uid
  }

  let uidRet = uidReg.exec(e.msg)
  if (uidRet) {
    return uidRet[0]
  }
  let uid = false

  try {
    let user = await MysApi.initUser(e)

    if (!user || !user.uid) {
      return false
    }
    uid = user.uid
    if ((!uid || !uidReg.test(uid)) && !e._replyNeedUid) {
      e.reply(['请先发送【#绑定+你的UID】来绑定查询目标\n星铁请使用【#星铁绑定+UID】', new Button(e).bindUid()])
      e._replyNeedUid = true
      return false
    }
  } catch (err) {
    console.log(err)
  }
  return uid || false
}

export async function getTargetUid (e) {
  let uid = await _getTargetUid(e)
  if (uid) {
    e.uid = uid
  }
  return uid
}

export async function getProfileRefresh (e, avatar) {
  let char = Character.get(avatar)
  if (!char) {
    return false
  }

  let player = Player.create(e)
  let profile = player.getProfile(char.id)
  if (!profile || !profile.hasData) {
    logger.mark(`本地无UID:${player.uid}的${char.name}面板数据，尝试自动请求...`)
    await player.refresh({ profile: true })
    profile = player.getProfile(char.id)
  }
  if (!profile || !profile.hasData) {
    if (!e._isReplyed) {
      e.reply(`暂无 ${char.name} 的面板数据。\n请先发送 #扫码登录（已登录可跳过），再按游戏发送更新指令：\n原神：#更新面板\n星铁：*更新面板\n绝区零：%更新面板\n更新完成后，再查看角色面板。`)
    }
    return false
  }
  return profile
}

/*
* 面板帮助
* */
export async function profileHelp (e) {
  e.reply(segment.image(`file://${miaoPath}/resources/character/imgs/help.jpg`))
  return true
}
