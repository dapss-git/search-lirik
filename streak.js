let handler = async (m, { conn, text, command, usedPrefix }) => {
    let users = global.db.data.users
    
    // ==========================================
    // 🚩 COMMAND: .bikinstreakbot
    // ==========================================
    if (command === 'bikinstreakbot') {
        if (!users[m.sender]) users[m.sender] = {}
        
        // Cek jika sudah aktif
        if (users[m.sender].isStreakActive) return m.reply('Streak bot kamu sudah aktif, Bro! 🔥')

        users[m.sender].streak = 0 
        users[m.sender].lastStreakDay = "" 
        users[m.sender].isStreakActive = true 

        m.reply(`✅ *Streak Berhasil dibuat!* \n\nSilakan mulai chat di grup untuk mengaktifkan apimu. \n\n⚠️ *INGAT:* Jangan sampai tidak chat selama 3 hari, atau data streak mu akan *DIHAPUS* dan kembali menjadi *0*!`)
        return
    }

    // ==========================================
    // 🚩 COMMAND: .streakleaderboard
    // ==========================================
    if (command === 'streakleaderboard' || command === 'topstreak') {
        let sortedStreak = Object.entries(users)
            .filter(([id, data]) => data.isStreakActive && data.streak > 0)
            .sort((a, b) => b[1].streak - a[1].streak)
            .slice(0, 10)

        if (sortedStreak.length === 0) return m.reply('Belum ada api yang menyala. 🔥')

        let teks = `*───〔 🔥 TOP STREAK 🔥 〕───*\n\n`
        sortedStreak.forEach(([id, data], i) => {
            let name = data.name || id.split('@')[0]
            teks += `${i + 1}. *${name}* — ${data.streak} Streak 🔥\n`
        })
        m.reply(teks)
    }
}

// ==========================================
// 🚩 LOGIKA AUTO STREAK (DETEKSI CHAT)
// ==========================================
handler.before = async function (m) {
    if (!m.isGroup || m.fromMe || !m.text) return
    let user = global.db.data.users[m.sender]
    
    // Hanya proses user yang sudah .bikinstreakbot
    if (!user || !user.isStreakActive) return

    let dateToday = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta' })
    
    // --- 1. CHAT PERTAMA KALI (START) ---
    if (user.lastStreakDay === "") {
        user.streak = 1
        user.lastStreakDay = dateToday
        m.reply(`Kamu Menyalakan Streak Bot 🔥${user.streak}`)
        return
    }

    let lastDate = new Date(user.lastStreakDay)
    let today = new Date(dateToday)
    let diffTime = Math.abs(today - lastDate)
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // --- 2. LOGIKA HAPUS DATA (3 HARI BOLONG) ---
    if (diffDays >= 3) {
        user.streak = 0
        user.lastStreakDay = ""
        user.isStreakActive = false 
        m.reply(`💀 *STREAK KAMU PADAM!* 💀\n\nKarena tidak chat selama ${diffDays} hari, data streak mu telah *DIHAPUS* dan kembali menjadi *0*.\n\nSilakan ketik *.bikinstreakbot* lagi untuk memulai.`)
        return
    }

    // --- 3. LOGIKA TAMBAH STREAK (1 PER 24 JAM) ---
    if (diffDays === 1) {
        user.streak += 1
        user.lastStreakDay = dateToday
        let fire = "🔥".repeat(Math.min(user.streak, 5))
        m.reply(`Streak mu menyala ${fire}${user.streak}`)
    }
    // Note: Jika diffDays == 0 (chat berkali-kali di hari yang sama), bot tidak membalas apa-apa.
}

handler.help = ['bikinstreakbot', 'streakleaderboard']
handler.tags = ['main']
handler.command = /^(bikinstreakbot|streakleaderboard|topstreak)$/i

export default handler
