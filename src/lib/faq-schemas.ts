import type { Locale } from './i18n-routing';

/** FAQ 项，用于 FAQPage 结构化数据 */
export interface FAQItem {
  question: string;
  answer: string;
}

/** 图片压缩页 FAQ */
export const compressFAQ: Record<Locale, FAQItem[]> = {
  'zh-CN': [
    { question: '如何选择合适的压缩质量？', answer: '一般情况下，70–85% 的质量在视觉上与原图差异很小，却能显著减小文件。用于网页或社交媒体可设为 75–80%，需要打印或存档时建议 85–95%。可从高往低尝试，找到画质与体积的平衡点。' },
    { question: 'JPG、PNG 和 WebP 有什么区别？', answer: 'JPG 适合照片和渐变图，压缩率高，但不支持透明；PNG 支持透明和无损压缩，适合 logo、截图；WebP 在同等画质下通常比 JPG/PNG 更小，现代浏览器均支持。选择「自动」时，工具会按原图格式和需求推荐输出格式。' },
    { question: '压缩会损坏图片吗？', answer: '有损压缩（如 JPG、WebP 的质量降低）会使画质略有损失，但在合理质量设置下肉眼难以察觉。PNG 无损压缩不会改变画质。所有处理均在您的浏览器本地完成，原始文件不会被修改或上传。' },
    { question: '支持批量压缩吗？单次可处理多少张？', answer: '支持。可一次上传多张图片进行批量压缩，每张独立处理并保留各自的质量和格式设置。处理能力取决于设备性能，建议单次不超过约 20 张以保证流畅体验。' },
  ],
  'en': [
    { question: 'How do I choose the right compression quality?', answer: 'Generally, 70–85% quality looks very close to the original while significantly reducing file size. For web or social media, use 75–80%; for print or archiving, 85–95% is recommended. Try adjusting from high to low to find the best balance.' },
    { question: "What's the difference between JPG, PNG, and WebP?", answer: "JPG is best for photos and gradients with high compression but no transparency. PNG supports transparency and lossless compression, ideal for logos and screenshots. WebP usually produces smaller files at similar quality and is supported by modern browsers. Choosing 'Auto' lets the tool pick the best format based on your image." },
    { question: 'Will compression damage my images?', answer: 'Lossy compression (e.g., JPG or WebP at lower quality) may slightly reduce image quality, but at reasonable settings the difference is often hard to notice. PNG lossless compression preserves full quality. All processing is done locally in your browser; original files are never modified or uploaded.' },
    { question: 'Does it support batch compression? How many images per batch?', answer: "Yes. You can upload multiple images at once for batch compression. Each image is processed independently with its own quality and format settings. Capacity depends on your device; we recommend up to about 20 images per batch for a smooth experience." },
  ],
  'ja-JP': [
    { question: '適切な圧縮品質はどう選びますか？', answer: '一般的に70〜85%の品質は原画に近い見た目を保ちながら、ファイルサイズを大幅に削減します。WebやSNS用は75〜80%、印刷やアーカイブ用は85〜95%を推奨します。高めから順に試して、画質と容量のバランスを見つけてください。' },
    { question: 'JPG、PNG、WebPの違いは？', answer: 'JPGは写真やグラデーションに最適で圧縮率が高いが透明は非対応。PNGは透明対応・可逆圧縮でロゴやスクリーンショット向き。WebPは同等画質で通常より小さく、モダンブラウザでサポート。「自動」を選ぶとツールが画像に応じて最適形式を選びます。' },
    { question: '圧縮で画像は劣化しますか？', answer: '可逆圧縮（JPGやWebPの品質低下）ではわずかな画質低下があり得ますが、適切な設定では目立たないことが多いです。PNG可逆圧縮は画質を維持します。すべての処理はブラウザ内でローカル実行され、原ファイルは変更・アップロードされません。' },
    { question: '一括圧縮に対応していますか？1回で何枚まで？', answer: '対応しています。複数画像を一度にアップロードして一括圧縮できます。各画像は独立して処理され、品質・形式設定も個別です。処理能力は端末に依存し、スムーズな操作のため1回あたり約20枚までを推奨します。' },
  ],
  'ko-KR': [
    { question: '압축 품질은 어떻게 선택하나요?', answer: '일반적으로 70–85% 품질은 원본과 시각적으로 거의 동일하면서 파일 크기를 크게 줄입니다. 웹이나 SNS용은 75–80%, 인쇄나 보관용은 85–95%를 권장합니다. 높은 쪽에서 낮은 쪽으로 조정해 보며 최적의 균형을 찾아보세요.' },
    { question: 'JPG, PNG, WebP의 차이는?', answer: 'JPG는 사진과 그라데이션에 적합하고 압축률이 높지만 투명을 지원하지 않습니다. PNG는 투명과 무손실 압축을 지원해 로고, 스크린샷에 적합합니다. WebP는 비슷한 품질에서 보통 더 작은 파일을 만들며, 최신 브라우저에서 지원됩니다.' },
    { question: '압축이 이미지를 손상시킬 수 있나요?', answer: '손실 압축(예: JPG, WebP의 낮은 품질)은 약간의 품질 저하를 일으킬 수 있지만, 적절한 설정에서는 차이가 눈에 잘 띄지 않습니다. PNG 무손실 압축은 품질을 유지합니다. 모든 처리는 브라우저에서 로컬로 이루어지며, 원본 파일은 수정·업로드되지 않습니다.' },
    { question: '일괄 압축을 지원하나요? 한 번에 몇 장까지?', answer: '지원합니다. 여러 이미지를 한 번에 업로드해 일괄 압축할 수 있습니다. 각 이미지는 개별적으로 처리되며 품질·형식 설정도 각각 적용됩니다. 한 번에 최대 20장 정도를 권장합니다.' },
  ],
};

/** 关于页 FAQ */
export const aboutFAQ: Record<Locale, FAQItem[]> = {
  'zh-CN': [
    { question: '使用这些工具需要注册账号吗？', answer: '大部分工具无需注册即可使用。注册账号可以保存您的作品和历史记录，享受更多个性化功能。' },
    { question: '我的文件会被上传到服务器吗？', answer: '不会！所有处理都在您的浏览器本地完成，文件不会上传到任何服务器，完全保护您的隐私安全。' },
    { question: '工具支持哪些文件格式？', answer: '不同工具支持不同格式。图片工具支持JPG、PNG、WebP、GIF；3D工具支持GLB、GLTF、OBJ等；代码工具支持多种编程语言。具体格式请查看各工具页面。' },
    { question: '如何反馈问题或建议新功能？', answer: '欢迎通过联系我们页面、GitHub Issues或社交媒体向我们反馈。您的建议对我们非常重要！' },
  ],
  'en': [
    { question: 'Do I need to register to use these tools?', answer: 'Most tools can be used without registration. Registering allows you to save your work and history, and enjoy more personalized features.' },
    { question: 'Will my files be uploaded to your servers?', answer: 'No! All processing is done locally in your browser. Your files are never uploaded to any server, protecting your privacy completely.' },
    { question: 'What file formats do the tools support?', answer: 'Different tools support different formats. Image tools support JPG, PNG, WebP, GIF; 3D tools support GLB, GLTF, OBJ; code tools support multiple programming languages. See each tool page for details.' },
    { question: 'How can I report issues or suggest new features?', answer: 'Please contact us via the Contact page, GitHub Issues, or social media. Your feedback is very important to us!' },
  ],
  'ja-JP': [
    { question: 'これらのツールを使用するには登録が必要ですか？', answer: 'ほとんどのツールは登録なしで使用できます。登録すると作品や履歴を保存し、パーソナライズ機能を利用できます。' },
    { question: '私のファイルはサーバーにアップロードされますか？', answer: 'いいえ！すべての処理はブラウザ内でローカルに行われます。ファイルはサーバーにアップロードされず、プライバシーが完全に保護されます。' },
    { question: 'ツールはどのファイル形式をサポートしていますか？', answer: 'ツールにより異なります。画像ツールはJPG、PNG、WebP、GIF対応。3DツールはGLB、GLTF、OBJ対応。コードツールは複数のプログラミング言語に対応。各ツールページで詳細を確認してください。' },
    { question: '問題の報告や新機能の提案はどうすればよいですか？', answer: 'お問い合わせページ、GitHub Issues、SNSからご連絡ください。フィードバックは大変重要です！' },
  ],
  'ko-KR': [
    { question: '이 도구들을 사용하려면 등록이 필요한가요?', answer: '대부분의 도구는 등록 없이 사용할 수 있습니다. 등록하면 작업물과 기록을 저장하고 더 많은 개인화 기능을 이용할 수 있습니다.' },
    { question: '내 파일이 서버에 업로드되나요?', answer: '아니요! 모든 처리는 브라우저에서 로컬로 이루어집니다. 파일이 서버에 업로드되지 않아 개인정보가 완전히 보호됩니다.' },
    { question: '도구는 어떤 파일 형식을 지원하나요?', answer: '도구마다 다릅니다. 이미지 도구는 JPG, PNG, WebP, GIF; 3D 도구는 GLB, GLTF, OBJ; 코드 도구는 여러 프로그래밍 언어를 지원합니다. 각 도구 페이지에서 확인하세요.' },
    { question: '문제를 보고하거나 새 기능을 제안하려면?', answer: '연락처 페이지, GitHub Issues, SNS를 통해 연락해 주세요. 피드백은 매우 중요합니다!' },
  ],
};
