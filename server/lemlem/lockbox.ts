// Lemlem Lockbox Template - Warm, Multilingual, Natural Tone
// Updated v4.3.3 - Clean responses without AI tags

type LangKey = 'en-US' | 'am-ET' | 'ti-ER' | 'om-ET' | 'zh-CN';

export function getLockboxReply(property: any, lang: string = 'en-US'): string {
  const opener: Record<LangKey, string> = {
    'en-US': "Oh, my dear — I don't seem to have this property's lockbox code in my memory just yet. 🗝️",
    'am-ET': "ልጄ ሆይ፣ የዚህን ቤት ቁልፍ ኮድ አላስታወስሁም እንደምትመስል 🗝️",
    'ti-ER': "ወዲያ ልጄ፣ ኮድ ዘይተሓትተረኒ እዩ እየ ይመስል 🗝️",
    'om-ET': "Mucaa koo, koodii kun akka hin yaadatamne fakkaata 🗝️",
    'zh-CN': "亲爱的，这个房源的密码我似乎还没有记住呢 🗝️",
  };

  const guidance: Record<LangKey, string> = {
    'en-US': "It's usually shared by the host 24 hours before check-in, either on your dashboard or by SMS.\nIf you haven't received it yet, kindly reach out to your host directly or tap \"Contact Host\" below. 💚",
    'am-ET': "በተለምዶ ኮድ ከመግቢያው ቀደም በ24 ሰዓት ይልካል። ባልተደረሰህም ሁኔታ እባክህ ከሆስቱ ቀጥታ ያነጋግሩ። 💚",
    'ti-ER': "ብቕዓት ኮድ 24 ሰዓት ብኽሪ ከይተመጽእ እዩ። እባክካ ከሆስት ቀጥታ ተዛዚረ። 💚",
    'om-ET': "Koodiin kun yeroo baay'ee sa'aatii 24 dura ergama. Yoo hin argatin, waliin hojjatu keetii quunnamaa. 💚",
    'zh-CN': "通常，房东会在入住前24小时通过短信或应用消息发送密码。如果还没收到，请直接联系房东。💚",
  };

  const o = opener[lang as LangKey] || opener['en-US'];
  const g = guidance[lang as LangKey] || guidance['en-US'];
  
  return `${o}\n${g}`;
}

// Helper to get lockbox code WITH the code (when available)
export function getLockboxCodeReply(code: string, location: string, lang: string = 'en-US', instructions?: string): string {
  const responses: Record<LangKey, string> = {
    'en-US': `🔑 Here's your lockbox information, dear:\n\n**Code:** ${code}\n**Location:** ${location || "At the property entrance"}\n${instructions ? `\n**Instructions:** ${instructions}\n` : ''}\nWelcome to your stay! 💚`,
    'am-ET': `🔑 የመቆለፊያ ሳጥን መረጃዎ እነሆ፣ ውድ ልጄ:\n\n**ኮድ:** ${code}\n**ቦታ:** ${location || "በንብረቱ መግቢያ"}\n${instructions ? `\n**መመሪያዎች:** ${instructions}\n` : ''}\nእንኳን ደህና መጡ! 💚`,
    'ti-ER': `🔑 ናይ መቆልፊ ሳጹን ሓበሬታኹም እነሆ፣ ውድ ልጀይ:\n\n**ኮድ:** ${code}\n**ቦታ:** ${location || "ኣብ መእተዊ ናይቲ ንብረት"}\n${instructions ? `\n**መምርሒታት:** ${instructions}\n` : ''}\nእንቛዕ ደሓን መጻእኩም! 💚`,
    'om-ET': `🔑 Odeeffannoo sanduqa cufsaa keessan kunooti, mucaa koo:\n\n**Koodii:** ${code}\n**Bakka:** ${location || "Balbala dhuunfaa irratti"}\n${instructions ? `\n**Qajeelfama:** ${instructions}\n` : ''}\nBaga nagaan dhuftan! 💚`,
    'zh-CN': `🔑 这是您的密码箱信息，亲爱的:\n\n**密码:** ${code}\n**位置:** ${location || "在房产入口处"}\n${instructions ? `\n**说明:** ${instructions}\n` : ''}\n欢迎入住！💚`,
  };

  return responses[lang as LangKey] || responses['en-US'];
}
