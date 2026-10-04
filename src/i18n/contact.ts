import type { Locale } from './types.ts';

export const CONTACT_EMAIL = 'contact@ytthumbnaildownloader.org';
export const CONTACT_HREF = `mailto:${CONTACT_EMAIL}`;

interface ContactContent {
  label: string;
  heading: string;
  operator: string;
  intro: string;
  copyright: string;
  privacy: string;
  privacyUse: string;
}

export const contactContent = {
  en: {
    label: 'Contact', heading: 'The developer behind this tool',
    operator: 'YT Thumbnail Downloader is built and maintained by an independent developer.',
    intro: 'For questions, bug reports, or feedback about the tool, email:',
    copyright: 'For a copyright concern, include the video or image URL, a description of the work you own or represent, and how to contact you. Please do not send sensitive personal information.',
    privacy: 'For questions about this policy or how the site handles your information, contact the independent developer who maintains YT Thumbnail Downloader:',
    privacyUse: 'If you email us, we use your email address and message to respond to and investigate your request. Our email providers handle message delivery and storage.',
  },
  ja: {
    label: 'お問い合わせ', heading: '運営者とお問い合わせ',
    operator: 'YT Thumbnail Downloaderは、個人開発者が制作・運営しています。',
    intro: 'ツールに関するご質問、不具合の報告、ご意見は、次のメールアドレスへお寄せください。',
    copyright: '著作権に関するお問い合わせには、動画または画像のURL、ご自身が権利を持つ著作物、または権利者の代理として扱う著作物の説明と、連絡先を添えてください。機密性の高い個人情報は送信しないでください。',
    privacy: 'このポリシーや情報の取り扱いについては、YT Thumbnail Downloaderを運営する個人開発者へお問い合わせください。',
    privacyUse: 'メールでお問い合わせいただいた場合、返信と内容の調査のために、メールアドレスとメッセージを利用します。メールの配信と保存は、利用しているメールサービス事業者が処理します。',
  },
  es: {
    label: 'Contacto', heading: 'Quién mantiene esta herramienta',
    operator: 'YT Thumbnail Downloader es una herramienta creada y mantenida por un desarrollador independiente.',
    intro: 'Para hacer preguntas, informar de errores o enviar comentarios sobre la herramienta, escribe a:',
    copyright: 'Si tienes una consulta sobre derechos de autor, incluye la URL del video o de la imagen, una descripción de la obra cuyos derechos posees o cuyo titular representas y tus datos de contacto. No envíes información personal sensible.',
    privacy: 'Si tienes preguntas sobre esta política o el tratamiento de tus datos, contacta con el desarrollador independiente que mantiene YT Thumbnail Downloader:',
    privacyUse: 'Si nos escribes por correo electrónico, usamos tu dirección de correo y tu mensaje para responder e investigar tu solicitud. Nuestros proveedores de correo electrónico se encargan de la entrega y el almacenamiento de los mensajes.',
  },
  fr: {
    label: 'Contact', heading: 'Qui développe cet outil ?',
    operator: 'YT Thumbnail Downloader est créé et maintenu par un développeur indépendant.',
    intro: 'Pour poser une question, signaler un problème ou faire une suggestion, écrivez à :',
    copyright: 'Pour une question de droits d’auteur, indiquez l’URL de la vidéo ou de l’image, décrivez l’œuvre dont vous détenez les droits ou représentez le titulaire et précisez comment vous contacter. N’envoyez pas de données personnelles sensibles.',
    privacy: 'Pour toute question sur cette politique ou le traitement de vos données, contactez le développeur indépendant qui maintient YT Thumbnail Downloader :',
    privacyUse: 'Si vous nous écrivez par e-mail, nous utilisons votre adresse et votre message pour répondre à votre demande et l’examiner. Nos prestataires de messagerie assurent l’acheminement et le stockage des messages.',
  },
  de: {
    label: 'Kontakt', heading: 'Wer dieses Tool betreibt',
    operator: 'YT Thumbnail Downloader wird von einem unabhängigen Entwickler erstellt und betreut.',
    intro: 'Bei Fragen, Fehlermeldungen oder Feedback zum Tool erreichst du uns unter:',
    copyright: 'Bei einem Anliegen zum Urheberrecht nenne bitte die Video- oder Bild-URL, beschreibe das Werk, an dem du die Rechte hältst oder dessen Rechteinhaber du vertrittst, und gib eine Kontaktmöglichkeit an. Bitte sende keine sensiblen personenbezogenen Daten.',
    privacy: 'Bei Fragen zu diesen Datenschutzhinweisen oder zum Umgang mit deinen Daten kontaktiere den unabhängigen Entwickler von YT Thumbnail Downloader:',
    privacyUse: 'Wenn du uns eine E-Mail schickst, verwenden wir deine E-Mail-Adresse und deine Nachricht, um deine Anfrage zu beantworten und zu prüfen. Unsere E-Mail-Anbieter übernehmen die Zustellung und Speicherung der Nachrichten.',
  },
  it: {
    label: 'Contatti', heading: 'Chi gestisce questo strumento',
    operator: 'YT Thumbnail Downloader è creato e mantenuto da uno sviluppatore indipendente.',
    intro: 'Per domande, segnalazioni di errori o suggerimenti sullo strumento, scrivi a:',
    copyright: 'Per una questione di copyright, indica l’URL del video o dell’immagine, descrivi l’opera di cui detieni i diritti o rappresenti il titolare e fornisci un recapito. Non inviare dati personali sensibili.',
    privacy: 'Per domande su questa informativa o sul trattamento dei tuoi dati, contatta lo sviluppatore indipendente che gestisce YT Thumbnail Downloader:',
    privacyUse: 'Se ci scrivi via email, usiamo il tuo indirizzo email e il messaggio per rispondere alla tua richiesta ed esaminarla. I nostri fornitori di posta elettronica gestiscono la consegna e l’archiviazione dei messaggi.',
  },
  ko: {
    label: '문의', heading: '도구 운영자와 문의',
    operator: 'YT Thumbnail Downloader는 개인 개발자가 만들고 관리합니다.',
    intro: '도구에 관한 질문, 오류 신고 또는 의견은 다음 이메일로 보내 주세요.',
    copyright: '저작권 관련 문의에는 영상 또는 이미지 URL, 본인이 권리를 보유하거나 권리자를 대리하는 저작물에 대한 설명, 연락 방법을 포함해 주세요. 민감한 개인정보는 보내지 마세요.',
    privacy: '이 안내나 개인정보 처리에 관한 질문은 YT Thumbnail Downloader를 운영하는 개인 개발자에게 문의해 주세요.',
    privacyUse: '이메일로 문의하시면 답변과 문의 내용 확인을 위해 이메일 주소와 메시지를 사용합니다. 이메일 서비스 제공업체는 메시지의 전송과 보관을 처리합니다.',
  },
  'pt-br': {
    label: 'Contato', heading: 'Quem mantém esta ferramenta',
    operator: 'O YT Thumbnail Downloader é criado e mantido por um desenvolvedor independente.',
    intro: 'Para dúvidas, relatos de erros ou sugestões sobre a ferramenta, envie um e-mail para:',
    copyright: 'Para uma questão de direitos autorais, inclua a URL do vídeo ou da imagem, uma descrição da obra sobre a qual você detém os direitos ou cujo titular representa e uma forma de contato. Não envie dados pessoais sensíveis.',
    privacy: 'Se tiver dúvidas sobre esta política ou sobre o tratamento dos seus dados, entre em contato com o desenvolvedor independente que mantém o YT Thumbnail Downloader:',
    privacyUse: 'Se você nos enviar um e-mail, usaremos seu endereço de e-mail e sua mensagem para responder e analisar sua solicitação. Nossos provedores de e-mail cuidam da entrega e do armazenamento das mensagens.',
  },
  ru: {
    label: 'Контакты', heading: 'Кто поддерживает сервис',
    operator: 'YT Thumbnail Downloader создан и поддерживается независимым разработчиком.',
    intro: 'Если у вас есть вопросы о сервисе, сообщения об ошибках или предложения, напишите нам:',
    copyright: 'Если вопрос касается авторских прав, укажите URL видео или изображения, опишите произведение, права на которое принадлежат вам или лицу, которое вы представляете, и оставьте контактные данные. Не отправляйте конфиденциальные персональные сведения.',
    privacy: 'По вопросам об этой политике или обработке ваших данных свяжитесь с независимым разработчиком YT Thumbnail Downloader:',
    privacyUse: 'Если вы пишете нам по электронной почте, мы используем ваш адрес и сообщение, чтобы ответить на обращение и разобраться в нём. Наши почтовые провайдеры обеспечивают доставку и хранение сообщений.',
  },
  'zh-tw': {
    label: '聯絡', heading: '開發者與聯絡方式',
    operator: 'YT Thumbnail Downloader 由個人開發者建立與維護。',
    intro: '如有使用問題、錯誤回報或建議，請寄信至：',
    copyright: '如需反映著作權問題，請提供影片或圖片網址、你擁有權利或經授權代為處理的作品說明，以及聯絡方式。請勿寄送敏感個人資料。',
    privacy: '如對本政策或本站處理資料的方式有疑問，請聯絡維護 YT Thumbnail Downloader 的個人開發者：',
    privacyUse: '如果你寄信給我們，我們會使用你的電子郵件地址與信件內容，回覆並查明你的問題。郵件服務提供者會處理信件的傳送與儲存。',
  },
} satisfies Record<Locale, ContactContent>;
