export async function asyncFetchProfile(ndk, obj) {
  if (obj.npub) {
    const user = await ndk.getUser({ npub: obj.npub })
    await user.fetchProfile()
    return user.profile
  }
  if (obj.pubkey) {
    const user = await ndk.getUser({ pubkey: obj.pubkey })
    await user.fetchProfile()
    return user.profile
  }
  return {}
}
