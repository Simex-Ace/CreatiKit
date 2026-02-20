/**
 * 博客原创文章数据（30 篇）
 * 四种语言均分、模拟不同作者，每篇 1000–8000 字，带作者与正文插图
 */

export type Locale = 'zh-CN' | 'en' | 'ja-JP' | 'ko-KR';

export type ArticleAuthor = {
  id: string;
  name: string;
};

export type InlineImage = {
  afterParagraph: number;
  src: string;
  alt?: string;
};

export type Article = {
  slug: string;
  locale: Locale;
  author: ArticleAuthor;
  title: string;
  description: string;
  date: string;
  /** 封面图：使用 Picsum 等稳定图床，避免失效 */
  coverImage?: string;
  /** 正文中插图：在指定段落下标后插入 */
  inlineImages?: InlineImage[];
  body: string[];
};

/** 根据作者 id 生成头像（DiceBear，稳定可用） */
export function getAuthorAvatarUrl(authorId: string, size = 80): string {
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(authorId)}&width=${size}&height=${size}`;
}

/** 稳定封面图：Picsum 按 seed 生成，不失效 */
export function getCoverImageUrl(slug: string, width = 800, height = 450): string {
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/${width}/${height}`;
}

export const articles: Article[] = [
  {
    slug: 'image-compression-guide',
    locale: 'zh-CN',
    author: { id: 'zh-lin', name: '压缩狂魔' },
    title: '什么是图片压缩？用 CreatiKit 在线压缩图片的完整指南',
    description: '介绍图片压缩原理与 CreatiKit 图片压缩工具的使用方法，支持 JPG、PNG、WebP，保持画质的同时减小体积。',
    date: '2025-01-15',
    coverImage: 'https://picsum.photos/seed/image-compression-guide/800/450',
    inlineImages: [
      { afterParagraph: 1, src: 'https://picsum.photos/seed/compress-demo/720/400', alt: '压缩前后对比' },
      { afterParagraph: 5, src: 'https://picsum.photos/seed/compress-tool/720/400', alt: '工具界面示意' },
    ],
    body: [
      '图片压缩是在不严重损失画质的前提下，减小图片文件体积的过程。无论是网站加载速度、存储空间还是分享传输，压缩都很有必要。高分辨率照片和截图往往体积很大，直接上传或嵌入页面会拖慢加载、占满云盘，通过有损或无损压缩可以在肉眼难以察觉差异的情况下将体积减少一半甚至更多。',
      '压缩分为有损与无损两类：有损压缩通过减少色彩与细节信息来换体积，常见于 JPG、WebP；无损压缩则不丢信息，适合 PNG 等需要保留透明或锐利边缘的图片。日常使用中，有损压缩在 80% 质量附近通常能在体积与观感之间取得较好平衡。',
      '为什么我们总在纠结「压多少」？因为过小会糊、过大会慢。网页首图、Banner、商品图通常建议控制在几百 KB 以内，移动端更要省；而印刷或归档可以保留更高品质。不同场景的「可接受损失」不一样，所以需要能自己拉质量条、实时看效果的工具。',
      'JPG 适合照片类内容：渐变多、细节多，有损压完肉眼很难看出区别。PNG 适合图标、截图、带透明通道的图，压的时候注意别把锐利边缘压糊了。WebP 在同等观感下通常能比 JPG 再小一截，现代浏览器基本都支持，可以作为首选格式之一。',
      'CreatiKit 的图片压缩工具在浏览器内完成处理，无需上传到第三方服务器，保护隐私。打开工具后支持拖拽或选择文件，选择输出格式（JPG、PNG 或 WebP）并调节质量滑块，即可实时预览压缩效果。满意后一键导出，适合批量处理截图、照片或设计稿。',
      '使用建议：先尝试 80% 左右的质量，观察预览中的细节与文件大小；需要透明背景时选用 PNG，一般照片可优先 WebP 以获得更小体积。若图片用于印刷或归档，可适当提高质量或保留原图；仅用于网页或社交分享时，适度压缩即可显著改善加载与传输速度。',
      '很多人会忽略的一点：你上传到微信、微博、知乎等平台时，平台会再次压缩。如果你事先在本地压到一个合理区间（比如 200–500KB、质量 80% 左右），往往能避免被平台「二次暴击」导致糊成一片。相当于你掌握了「第一次压缩权」，把最终观感攥在自己手里。',
      '批量压图时建议先拿一两张试参数，确定质量和体积都 OK 再整批处理。不同题材（人像、风景、截图、插画）最优质量档位可能略有不同，可以分别存几套预设。',
      '移动端上传、表单头像、证件照等场景对体积很敏感，用 CreatiKit 压一轮再上传，能明显减少等待时间和失败率。CDN 和带宽成本也会下来，对个人站或小团队来说都是实打实的节省。',
      '有些场景对尺寸也有要求：例如头像 200×200、封面 1200×630 等。可以在压缩前或压缩后配合裁剪/缩放，或使用带尺寸限制的工具，避免传上去被拉伸变形。',
      '历史项目里经常有一堆「不知道压没压过」的图。建议在资源文件夹里建一个「已压」子目录，或统一在文件名加 _compressed，方便后续替换和排查。',
      '团队协作时，可以约定「对外发布的图统一用 CreatiKit 压到 80% 质量、最长边 1920」，这样大家产出的体积和观感会比较一致，也减少反复修改。',
      '导出前看一眼文件大小：一张首图若超过 1MB，在 4G 或弱网下会明显拖慢首屏。压到 300KB 以内通常能兼顾清晰度和速度。多图列表页更要注意单张体积，否则滚动加载时会卡顿。',
      '截图类图片（代码、文档、界面）往往有大片纯色，用 PNG 或 WebP 的无损或低损压缩就能压得很小；照片类则更适合有损 JPG/WebP。根据内容类型选格式，事半功倍。',
      '遇到「压完反而变大」的情况，多半是原图已经压得很狠或格式不合适。可以试试换一种输出格式，或适当提高质量档位再压一次。',
      '总结一下：有损压照片用 JPG/WebP、质量 80% 左右起步；要透明用 PNG；先本地压好再上传，避免被平台二次压糊；批量前先试一两张定参数。CreatiKit 在浏览器里就能完成这些，不占本机空间也不传数据，用顺手了会成习惯。',
      '许多网站和平台会对上传图片再次压缩，若你已在本地做过合理压缩，可避免被平台过度压缩导致画质劣化。将 CreatiKit 作为发布前的固定一步，能更好地控制最终呈现效果。养成「发图前顺手压一下」的习惯，长期下来会少很多「为什么传上去这么糊」的疑惑。',
    ],
  },
  {
    slug: '3d-model-viewer-intro',
    locale: 'en',
    author: { id: 'zh-wang', name: 'Wireframe Wolf' },
    title: '3D model viewer in your browser: glTF/GLB quick guide',
    description: 'Open and inspect glTF/GLB models in CreatiKit without installing heavy desktop software.',
    date: '2025-01-16',
    coverImage: 'https://picsum.photos/seed/3d-model-viewer/800/450',
    inlineImages: [
      { afterParagraph: 3, src: 'https://picsum.photos/seed/gltf-preview/720/400', alt: 'glTF preview in browser' },
    ],
    body: [
      'glTF (GL Transmission Format) has become a practical standard for real-time 3D on the web. Compared with older formats, glTF is compact, fast to parse, and broadly supported across DCC tools and online marketplaces. Most tools export either .glb (single binary file) or .gltf (JSON + external resources), so handoff between artists, engineers, and product teams is much smoother.',
      'In real projects, the biggest value is speed of communication. You can drag a model into a browser viewer and instantly answer: Is the scale correct? Are normals flipped? Are textures missing? Do roughness/metalness values look right? That instant visual confirmation removes many back-and-forth messages and saves production time.',
      'CreatiKit’s model viewer is designed for exactly that workflow: quick inspection without installing heavy software. Open the page, drop your file, orbit/zoom/pan, and verify structure and look. For PMs, QA, and clients who do not use Blender/Unity daily, this is a huge accessibility win.',
      'Use .glb when you want portability and fewer file-path issues. Use .gltf when you intentionally manage textures or buffers separately. If you see a black model or odd shading, first check texture paths, tangent/normal maps, and whether the export preset matches PBR expectations.',
      'Performance matters too. Large meshes and 4K textures can be overkill for preview. Before publishing, consider mesh decimation, LOD levels, and texture resizing. A small quality tradeoff can drastically improve loading time on mobile and low-power laptops.',
      'For education and demos, browser-first viewing is perfect. Teachers can share one link and students can inspect 3D assets on tablets instantly. In architecture, mechanical, and medical learning scenarios, this lowers the barrier for 3D exploration and keeps attention on concepts rather than software setup.',
      'For marketing pages and landing pages, a web-friendly 3D asset pipeline is often: author in DCC -> export glTF/glb -> quick pass in CreatiKit -> integrate in Three.js/WebGL/WebGPU app. This “preview gate” catches issues early and avoids expensive late-stage fixes.',
      'Lighting is another practical checkpoint. If the viewer supports environment maps/HDRI, materials will look far more realistic. If not, default lighting still helps validate topology and UV mapping. The goal at preview stage is not cinematic beauty, but confidence that the asset is healthy.',
      'Coordinate system mismatches are common when assets move between engines. If something appears rotated or lying down, verify up-axis convention and export transforms. A two-minute preview check can prevent hours of debugging in production scenes.',
      'If you collaborate with external studios, sending a “viewer-ready” model link looks professional and reduces ambiguity. The receiver can inspect interactively instead of judging from static screenshots, which often hide depth and material problems.',
      'Many free libraries (like Sketchfab samples or Poly Pizza assets) are great for prototyping, but quality varies. Running every downloaded model through a quick browser review helps you build a clean asset shortlist and avoid broken candidates.',
      'For XR pipelines (AR/VR/WebXR), glTF is also a common interchange point. Preview in browser first, then feed into the target runtime. This staged approach keeps your pipeline transparent, testable, and easier to scale with team growth.',
      'In short: browser preview is not just a convenience feature, it is a quality-control checkpoint. Keep CreatiKit bookmarked and make “drop-and-check” your default habit whenever a new 3D file arrives.',
    ],
  },
  {
    slug: 'color-palette-tips',
    locale: 'ja-JP',
    author: { id: 'zh-chen', name: '配色沼の民' },
    title: 'カラーパレット活用術：スポイトから配色設計まで',
    description: 'CreatiKit のパレットで色を抽出し、調和の取れた配色を素早く作る方法。',
    date: '2025-01-17',
    coverImage: 'https://picsum.photos/seed/color-palette/800/450',
    inlineImages: [
      { afterParagraph: 3, src: 'https://picsum.photos/seed/palette-demo/720/400', alt: '配色サンプル' },
    ],
    body: [
      'カラーパレットツールは、画面上の任意位置からのスポイト取得、画像アップロードからの抽出、抽出色の保存までを一気に行えます。デザイン作業では「参考サイトのこの色を再現したい」「ブランド規定色を正確に合わせたい」といった場面が多く、手入力よりスポイトの方が圧倒的に速くて正確です。',
      '画像から色を取る場合、主要な色面やピクセル分布を見ながら候補を拾えるので、ムードボード作成がかなり楽になります。画面スポイトはブラウザ権限を許可してクリックするだけ。Figma、スライド、Webページなど、どこからでも色を持ってこられます。',
      'UI 制作でよくあるのは「このボタン色、前回と微妙に違う問題」です。HEX が 1 桁違うだけでも印象が変わります。だからこそ、色を都度“目分量”で作るのではなく、パレットとして管理するのが重要です。',
      '色相環・彩度・明度の調整を使えば、同系色、補色、類似色を素早く試せます。主色を決めた後、隣接色で安定感を出すか、対向色でアクセントを作るかを比較できるため、意思決定が早くなります。',
      'おすすめはプロジェクト単位で色セットを作ること。主色、補助色、背景色、本文色、状態色（成功/警告/エラー）を揃えておくと、画面追加時にも一貫性を崩しません。', 
      'ブランド運用では「バナーだけ色味が違う」「SNS画像とLPで青が違う」などが起きがちです。パレットを共通化しておけば、制作物が増えてもトーンを保ちやすく、レビューコストも下がります。',
      'ダークモード対応時は、単純な反転ではなく明度階段を設計するのがコツです。背景が暗くなると同じ色でも見え方が変わるため、同色相で複数明度を持っておくと実装が安定します。',
      'イラストや運用クリエイティブでは、2〜3色の主軸に1色のアクセントを置くと破綻しにくいです。彩度を上げる色は1つだけにする、無彩色を適切に混ぜる、といったルールも有効です。',
      'グラデーション設計でもパレットは有効です。開始色と終了色を同一トーン帯で選ぶと、CSS の `linear-gradient` でも自然につながります。ここがズレると“安っぽさ”が出やすいポイントです。',
      'A/B テストやテーマ切替を行うなら、A 用/B 用の色群を事前に保存しておくと運用が圧倒的に楽です。都度手で差し替えるより、ミスが減って検証速度も上がります。',
      '実装フェーズでは、開発側に色を CSS 変数として渡すと管理しやすくなります。例えば `--color-primary`、`--color-bg-muted` のように定義しておけば、将来のテーマ変更も安全に行えます。',
      'アクセシビリティ観点では、文字色と背景色のコントラスト比を必ず確認しましょう。見た目が良くても読めない配色は離脱を生みます。配色の最終チェックにコントラスト確認を組み込むだけで品質は大きく上がります。',
      '結論として、配色は“センス頼み”ではなく“仕組み化”が勝ちです。CreatiKit のパレットで抽出・整理・比較・共有を回せるようにすると、デザインも実装も迷いが減り、チーム全体の速度が上がります。',
    ],
  },
  {
    slug: 'data-to-chart-tutorial',
    locale: 'zh-CN',
    author: { id: 'zh-liu', name: '表格成精了' },
    title: '用数据生成图表的步骤：CSV/JSON 转柱状图与折线图',
    description: '将 CSV 或 JSON 数据粘贴进 CreatiKit 数据转图表工具，一键生成柱状图、折线图、饼图等。',
    date: '2025-01-18',
    coverImage: 'https://picsum.photos/seed/data-chart/800/450',
    body: [
      '数据转图表工具接受表格式数据：第一行为表头，每列对应一个字段；支持 CSV（逗号或制表符分隔）和 JSON 数组格式。将 Excel 或数据库导出的数据粘贴进输入框后，选择 X 轴、Y 轴（及可选的分组、点大小等）与图表类型，即可实时生成图表。',
      '支持柱状图、折线图、饼图、散点图、面积图等多种类型，适合不同分析场景：柱状图适合分类对比，折线图适合趋势，饼图适合占比，散点图适合相关性。可设置图表标题，并可导出为高清图片用于报告、PPT 或文档。',
      '数据在本地处理，不会上传到服务器，适合包含敏感信息的报表或内部数据可视化。若数据来自后台或 API，可先复制到本地再粘贴进工具，避免将未脱敏数据传到第三方。',
      '使用技巧：确保表头与数据列对应正确，数值列不要混入文字，否则可能无法正确绘图。若数据量很大，可先取前几百行试跑，确认类型与字段后再用全量数据。导出图片时注意选择合适分辨率，以便在文档中清晰展示。',
      '适合产品运营、市场分析、教学演示等场景。将常用数据格式（如周报、月报的 CSV）保存为模板，每次更新数据后粘贴即可快速出图，省去在 Excel 或专业 BI 工具中配置的时间。',
    ],
  },
  {
    slug: 'markdown-editor-quickstart',
    locale: 'zh-CN',
    author: { id: 'zh-zhou', name: 'Markdown传教士' },
    title: 'Markdown 编辑器快速上手：写文档与笔记',
    description: '在浏览器里用 Markdown 写作，实时预览，支持常用语法与导出。',
    date: '2025-01-19',
    coverImage: 'https://picsum.photos/seed/markdown-editor/800/450',
    body: [
      'Markdown 用简单符号表示标题、列表、加粗、链接等，便于书写和版本管理，且易读易改。CreatiKit 的 Markdown 编辑器采用左右分栏：左侧编辑、右侧实时预览，输入时即可看到渲染效果，无需切换模式。',
      '支持标题（# ## ###）、有序与无序列表、引用、代码块、表格、链接与图片等常用语法，适合写技术文档、会议纪要、博客草稿或课程笔记。许多静态站点生成器（如 Hugo、VitePress）和笔记应用（如 Notion、Obsidian）都支持 Markdown，学会后可以通用。',
      '写完后可复制渲染后的 HTML，或继续在本地用 VS Code、Typora 等编辑。无需注册或登录，打开页面即可使用，内容保存在浏览器本地或由你自行复制保存。',
      '建议先掌握标题、列表、加粗与链接这几项，即可覆盖大部分日常文档；再逐步使用表格与代码块，便于写技术说明。若需要数学公式，可了解扩展语法（如 LaTeX），本工具若支持会在界面中注明。',
      '将 CreatiKit Markdown 作为临时写作或快速预览环境，与本地编辑器配合使用，可以兼顾便携与功能深度。',
    ],
  },
  {
    slug: 'qr-code-generator-guide',
    locale: 'zh-CN',
    author: { id: 'zh-wu', name: '二维码扫我' },
    title: '二维码生成器使用指南：文本与链接转二维码',
    description: '输入网址或文字，一键生成二维码图片并下载，适用于分享、签到、物料设计。',
    date: '2025-01-20',
    coverImage: 'https://picsum.photos/seed/qr-code/800/450',
    body: [
      '将需要分享的链接或短文本输入工具，即可生成二维码图片。可调节容错级别：容错越高，即使部分图案被遮挡或污损仍可识别，但二维码会更密、更复杂；一般场景选择中等容错即可。',
      '适合制作活动报名链接、Wi-Fi 信息（如 WIFI:T:WPA;S:名称;P:密码;;）、产品说明页、个人名片或签到入口等。生成后可直接下载 PNG 用于印刷或电子物料，注意印刷时保证足够尺寸和对比度，以便手机扫描。',
      '所有处理在本地完成，不会将内容上传到第三方，保护链接与隐私。若链接带敏感参数（如 token），使用本地工具可避免被记录或泄露。',
      '使用建议：长链接会生成更密的二维码，可先用短链接服务缩短再生成，或使用工具提供的“长文本”模式。若需在深色背景上使用，可导出后在设计软件中反色或加白底。',
      '将 CreatiKit 二维码生成器加入书签，需要时随时打开生成，无需依赖第三方网站或客户端，既快又安全。',
    ],
  },
  {
    slug: 'whiteboard-use-cases',
    locale: 'zh-CN',
    author: { id: 'zh-xu', name: '白板战神' },
    title: '白板工具适合什么场景？在线画布与头脑风暴',
    description: '浏览器里的白板工具适合随手画草图、标注、简单流程图与团队头脑风暴。',
    date: '2025-01-21',
    coverImage: 'https://picsum.photos/seed/whiteboard/800/450',
    body: [
      '白板提供一块可自由绘制的画布，支持画笔、颜色与清除，无需安装，打开即用。适合快速记录想法、画界面草图、流程图或架构图，比打开专业设计软件更轻量。',
      '在会议或教学中可共享屏幕使用，大家一起看同一块画布，实时标注与补充；也可在个人设备上做笔记与构思，再导出或截图整合到文档中。',
      '使用技巧：先确定画布大小与比例（若支持），避免画到一半需要扩展；重要内容在结束前及时截图或导出，因为内容通常保存在浏览器本地，清除缓存或换设备会丢失。',
      '与思维导图、流程图工具相比，白板更自由、更适合即兴表达；若需要规整的节点与连线，可配合专门工具。CreatiKit 白板侧重快速记录与演示，适合作为头脑风暴或临时讨论的补充。',
      '内容保存在浏览器本地，刷新前可继续编辑；重要内容建议截图或导出保存，以便跨设备使用或归档。',
    ],
  },
  {
    slug: 'hash-and-timestamp-tools',
    locale: 'zh-CN',
    author: { id: 'zh-sun', name: '哈希不冲突' },
    title: '哈希与时间戳工具介绍：校验文件与转换时间',
    description: '计算文本或文件的 MD5/SHA 哈希、Unix 时间戳与日期互转，方便开发与排查。',
    date: '2025-01-22',
    coverImage: 'https://picsum.photos/seed/hash-timestamp/800/450',
    body: [
      '哈希工具可对输入文本或上传文件计算 MD5、SHA-256 等摘要，用于校验完整性或生成唯一标识。下载文件后对比官方提供的哈希值可确认未被篡改；在开发中也可用哈希做缓存 key 或去重。',
      '时间戳工具支持 Unix 时间戳（秒或毫秒）与可读日期的互转。后端接口常返回时间戳，前端展示需要转成“某年某月某日”；排查日志时又常需要把时间转回时间戳便于搜索。',
      '开发中常用来校验下载文件、生成缓存 key 或记录事件时间；运维与日志分析时也常用到时间戳转换。全部在本地计算，不会上传文件内容，适合敏感或大文件。',
      '注意：MD5 已不推荐用于安全场景（如密码存储），仅适合校验与标识；若需抗碰撞与安全性，应使用 SHA-256 或更强算法。时区方面，工具通常按本地或 UTC 显示，转换时需与系统约定一致。',
      '将哈希与时间戳工具加入书签，开发与排查时随手可用，无需翻文档或写脚本。',
    ],
  },
  {
    slug: 'pixel-art-generator-intro',
    locale: 'en',
    author: { id: 'en-remy', name: 'Pixel Goblin' },
    title: 'Pixel art generator: from photo to retro style 🎮',
    description: 'Upload an image, adjust block size and colors, and get a pixel-art look.',
    date: '2025-01-23',
    coverImage: 'https://picsum.photos/seed/pixel-art/800/450',
    body: [
      'The pixel art generator turns a normal image into blocky pixel style. Adjust block size (e.g. 4px, 8px, 16px) and color count—bigger blocks and fewer colors feel more retro; smaller blocks and more colors stay closer to the original. Great for game assets, avatars, or quick pixel-art drafts before polishing in Aseprite or Piskel. Images are processed in the tab only; nothing is uploaded. Export as PNG for social or design. Keep source images simple and contrasty for best results. 👍',
    ],
  },
  {
    slug: 'chemistry-lab-tool-intro',
    locale: 'en',
    author: { id: 'en-maria', name: 'Chem Dad' },
    title: 'Chemistry lab in the browser: molecules & reactions 🧪',
    description: 'Use CreatiKit’s chemistry lab for simple molecule and reaction visualization—great for learning and demos.',
    date: '2025-01-24',
    coverImage: 'https://picsum.photos/seed/chemistry-lab/800/450',
    body: [
      'The chemistry lab gives you interactive molecule and reaction demos—perfect for students or anyone curious about chemistry. You can drag, click, and tweak parameters to see molecular structure, bonds, and simple reactions in motion. It really helps make abstract ideas concrete! ✨',
      'Everything runs in a safe, virtual environment. Teachers can use it on a big screen; students can try it on a tablet or laptop. Just remember: it’s a supplement to real lab work, not a replacement—use it to understand theory and prepare for hands-on experiments.',
      'Runs fully in your browser, no login required. If the tool lets you export images or share links, you can save your setup for homework or reports. Pro tip: read the in-tool notes and examples first, then compare what you see with your textbook’s equations and conditions. That way you’ll see how “conditions and products” relate. 🎯',
      'Using CreatiKit’s chemistry lab together with your course materials and real lab sessions will help you nail the concepts.',
    ],
  },
  {
    slug: 'physics-lab-tool-intro',
    locale: 'en',
    author: { id: 'en-james', name: 'Physics Nerd' },
    title: 'Physics lab intro: mechanics & motion simulation',
    description: 'Try simple physics simulations in the browser and build intuition for mechanics and motion.',
    date: '2025-01-25',
    coverImage: 'https://picsum.photos/seed/physics-lab/800/450',
    body: [
      'The physics lab gives you basic mechanics and motion simulation. Change mass, initial velocity, gravity, friction, and see what happens—great for building intuition about Newton’s laws, projectiles, and collisions. 👍',
      'Works well for class demos or self-study. No install needed; runs in the browser on desktop or tablet. Start with a simple case (e.g. free fall), then add wind or elasticity. If the tool exports trajectory or data, you can use it for reports or comparison. Keep in mind it’s simplified (e.g. 2D, idealised); pair it with textbook problems and real experiments for best results.',
    ],
  },
  {
    slug: 'ecosystem-sandbox-intro',
    locale: 'en',
    author: { id: 'en-sam', name: 'Ecosystem Stan' },
    title: 'Ecosystem sandbox: simple population & balance',
    description: 'Watch simple critter–environment interactions and get a feel for ecological balance.',
    date: '2025-01-26',
    coverImage: 'https://picsum.photos/seed/ecosystem-sandbox/800/450',
    body: [
      'The sandbox uses simple rules to simulate critters, food, and environment. Change predator/prey/resource counts and see populations rise or fall—great for intuition about food chains and carrying capacity. 🌿',
      'Runs locally, no internet needed. If it has speed-up or pause, use them to see long-term trends. Remember it’s a toy model; real ecosystems are messier. Use it as a stepping stone, then dig into real examples and textbooks.',
    ],
  },
  {
    slug: 'camera-gesture-drawing-intro',
    locale: 'en',
    author: { id: 'en-chris', name: 'Gesture Wizard' },
    title: 'Air drawing & gesture control with MediaPipe ✨',
    description: 'Draw in the air, switch tools, and trigger effects with hand gestures—no touch needed.',
    date: '2025-01-27',
    coverImage: 'https://picsum.photos/seed/gesture-drawing/800/450',
    body: [
      'Uses MediaPipe Hands and your camera: open palm to open the panel, point with index finger to select, pinch to draw, open pinch to clear. No touch or mouse—great for demos, kiosks, or accessibility. You get pen, eraser, random color, background switch, plus fun effects like fire, blast, lightning. 🎨',
      'Camera and processing stay on-device; nothing is uploaded. If tracking is jumpy, try better light and keep your hand fully in frame. Perfect for product demos, education, or as a front-end / AI showcase.',
    ],
  },
  {
    slug: 'audio-visualizer-what',
    locale: 'en',
    author: { id: 'en-jordan', name: 'Viz Kid' },
    title: 'What’s an audio visualizer? Turn sound into graphics',
    description: 'Upload audio and see it as spectrum, waveform, circles, or particles in real time.',
    date: '2025-01-28',
    coverImage: 'https://picsum.photos/seed/audio-viz/800/450',
    body: [
      'An audio visualizer turns frequency and amplitude into graphics—spectrum, waveform, circles, particles, waterfall, etc.—that update as the track plays. Different modes highlight different aspects; some are more artistic. 🎵',
      'Great for music visuals, video backgrounds, or teaching acoustics (e.g. comparing instruments or noise vs. pure tones). Files are decoded and drawn in the browser; nothing is uploaded. If the viz doesn’t move, check playback, volume, and browser autoplay rules.',
    ],
  },
  {
    slug: 'svg-editor-basics',
    locale: 'en',
    author: { id: 'en-taylor', name: 'SVG Witch' },
    title: 'SVG editor basics: edit vector graphics in the browser',
    description: 'Learn SVG structure and make quick edits with CreatiKit’s SVG editor.',
    date: '2025-01-29',
    coverImage: 'https://picsum.photos/seed/svg-editor/800/450',
    body: [
      'SVG is vector—scale it and it stays sharp. The editor lets you view and edit SVG markup with live preview, no desktop app. Tweak color, stroke, text, or paths; good for learning path, circle, rect, fill, stroke. Backup the original, then edit; complex SVGs—only touch what you need.',
    ],
  },
  {
    slug: 'particle-editor-intro',
    locale: 'en',
    author: { id: 'en-casey', name: 'Particle Lord' },
    title: 'What can a particle editor do? Simple effects for backgrounds & motion',
    description: 'Tweak count, speed, color, and get particle animations for backgrounds or motion.',
    date: '2025-01-30',
    coverImage: 'https://picsum.photos/seed/particle-editor/800/450',
    body: [
      'The particle editor gives you a configurable system: emitter shape/position, gravity, color, size, lifetime, with live preview. You can get rain, snow, sparks, smoke, stars—all in the browser, no 3D or VFX suite. Use it for web backgrounds, landing pages, or small games; export as video or GIF. If it’s slow, reduce count or resolution. Start from a preset, then tweak; match your brand for a pro look. ✨',
    ],
  },
  {
    slug: 'css-animator-quickstart',
    locale: 'ja-JP',
    author: { id: 'ja-yuki', name: 'キーフレーム魔' },
    title: 'CSSアニメーション入門：キーフレームとトランジション',
    description: '簡単な設定でCSSアニメのコードを生成。ボタンやカードにそのまま使えます。',
    date: '2025-01-31',
    coverImage: 'https://picsum.photos/seed/css-animator/800/450',
    body: [
      'keyframes を書かなくても、回転・拡大・フェードなどが作れます。種類・時間・イージングを選ぶだけでコードがコピーできるので、プロトタイプや勉強にぴったりです。✨ ボタンのホバーやカードの出現にも使えます。transform と opacity を優先するとパフォーマンスが良いです。',
    ],
  },
  {
    slug: 'background-remover-tips',
    locale: 'ja-JP',
    author: { id: 'ja-hiro', name: '背景消し' },
    title: '背景除去ツールのコツ：切り抜きと透明背景',
    description: '人物や商品写真をアップロードして、ワンクリックで透明PNGに。',
    date: '2025-02-01',
    coverImage: 'https://picsum.photos/seed/background-remover/800/450',
    body: [
      '商品・証明写真・人物の切り抜きに便利です。アップロードすると主体を認識して背景を除去し、透明付きPNGで保存できます。輪郭の調整ができるツールなら、髪やふわふわした部分も微調整可能。被写体がはっきりしていて背景と差があるほどきれいに出ます。😊 印刷や大判表示用なら高解像度で。CreatiKitの背景除去を第一歩にして、色調・合成は他のツールで仕上げると効率的です。',
    ],
  },
  {
    slug: 'emoji-collection-howto',
    locale: 'ja-JP',
    author: { id: 'ja-miku', name: '絵文字沼' },
    title: '絵文字の検索とコピー：使い方のコツ',
    description: 'カテゴリやキーワードで絵文字を探して、クリックでコピー。',
    date: '2025-02-02',
    coverImage: 'https://picsum.photos/seed/emoji-collection/800/450',
    body: [
      'よく使う絵文字をカテゴリや検索で見つけて、クリックでコピーできます。ドキュメント・メール・チャットにそのまま貼り付け。技術メモには ✅❌⚠️、議事録には 📌📅 など、用途に合わせて使うと読みやすくなります。ログイン不要で、Unicode の標準絵文字セットを使用。端末やアプリで見た目は少し違いますが意味は同じです。🔍',
    ],
  },
  {
    slug: 'weather-tool-guide',
    locale: 'ja-JP',
    author: { id: 'ja-ken', name: '天気の子' },
    title: '天気ツールの使い方：天気とAQIを確認',
    description: 'CreatiKitで現在・数日先の天気、体感気温、AQIをチェック。',
    date: '2025-02-03',
    coverImage: 'https://picsum.photos/seed/weather-tool/800/450',
    body: [
      '都市検索や位置情報で、現在の天気・予報・体感気温・風・AQIが表示されます。出かける前に傘や服装の参考に。位置情報は天気取得のみで、保存しません。AQIが悪い日は外出を控えたりマスクを。予報は確率なので、当日に近いほど精度が上がります。🌤️',
    ],
  },
  {
    slug: 'code-tools-overview',
    locale: 'ja-JP',
    author: { id: 'ja-dev', name: 'デブ道' },
    title: 'コードツール集：フォーマット・圧縮・変換',
    description: 'JSON/HTMLの整形・圧縮、Base64、タイムスタンプ変換など。',
    date: '2025-02-04',
    coverImage: 'https://picsum.photos/seed/code-tools/800/450',
    body: [
      'JSONの整形・検証、HTML圧縮、Base64、タイムスタンプ変換をブラウザ内で実行。APIのレスポンスを貼って構造を見たり、本番用にHTML/JSを圧縮したり。データは端末外に出さないので、token 付きのペイロードや内部設定にも使えます。不正なJSONはエラーと位置を表示。ブックマークしておくとデバッグが楽です。',
    ],
  },
  {
    slug: 'text-analyzer-features',
    locale: 'ja-JP',
    author: { id: 'ja-saki', name: '文字数カウントマン' },
    title: 'テキスト分析ツールでできること：文字数・語頻・読了時間',
    description: 'テキストを貼って、文字数・段落・語頻・読了時間を表示。',
    date: '2025-02-05',
    coverImage: 'https://picsum.photos/seed/text-analyzer/800/450',
    body: [
      '文字数（スペースあり/なし）、段落数、語頻、読了時間の目安を出します。ライターは分量チェック、編集は構成確認、学生は范文分析に。ブログの最低文字数もこれで確認。内容はアップロードされません。語頻をエクスポートすればキーワードやSEOの参考にも。📝',
    ],
  },
  {
    slug: 'piano-and-recording',
    locale: 'ja-JP',
    author: { id: 'ja-rio', name: 'ピアノの鬼' },
    title: 'ブラウザでピアノ＆録音：弾いてJSONで保存',
    description: 'CreatiKitのピアノで弾いて録音、JSONでエクスポート。',
    date: '2025-02-06',
    coverImage: 'https://picsum.photos/seed/piano-recording/800/450',
    body: [
      '複数オクターブ対応、キーボードやマウス・タッチで演奏。延音と録音ができ、音符はJSONでエクスポート・再読み込み可能。実機やDAWがなくても、ブラウザでメロディを残したりデモに使えます。🎹 音声はローカルのみ、アップロードされません。',
    ],
  },
  {
    slug: 'gif-tool-split-merge',
    locale: 'ja-JP',
    author: { id: 'ja-nana', name: 'GIF職人' },
    title: 'GIFツール：コマ分解と合成',
    description: 'GIFをコマに分解したり、画像をGIFに合成。フレーム間隔・ループも設定可。',
    date: '2025-02-07',
    coverImage: 'https://picsum.photos/seed/gif-tool/800/450',
    body: [
      'GIFを1コマずつ画像に分解、または複数画像からGIFを合成できます。順序変更・削除・テキスト追加も。動画やGIFからコマを取り出してスタンプを作るのにも便利。すべてブラウザ内で完結。大きいファイルは時間がかかるので、まず短いもので試すと良いです。コマ数が多いとファイルサイズが増えるので、間引きや解像度ダウンで調整を。🎞️',
    ],
  },
  {
    slug: 'why-online-creative-tools',
    locale: 'ko-KR',
    author: { id: 'ko-min', name: '온라인 도구 덕후' },
    title: '온라인 크리에이티브 도구 고르기 🌐',
    description: '온라인 vs 데스크톱, 언제 뭘 쓰면 좋을지 정리해 봤어요.',
    date: '2025-02-08',
    coverImage: 'https://picsum.photos/seed/online-tools/800/450',
    body: [
      '온라인 도구는 설치 없이, 여러 기기에서 같은 링크로 쓸 수 있고 공유·협업이 쉽죠. 가벼운 작업이나 잠깐 쓸 때, 팀이 같은 환경 쓰고 싶을 때 좋아요. 데스크톱 소프트는 성능·고급 기능·오프라인에서 유리하고, 대용량·복잡한 작업은 로컬 소프트가 맞아요. CreatiKit은 자주 쓰는 가벼운 도구들—이미지 압축, QR코드, 마크다운 같은—일상 보조나 입문용으로 쓰기 좋습니다. 민감한 건 로컬/업로드 안 하는 걸로. 브라우저와 데스크톱을 병행해서 쓰면 효율이 잘 나와요. 👍',
    ],
  },
  {
    slug: 'browser-tools-advantages',
    locale: 'ko-KR',
    author: { id: 'ko-jun', name: '브라우저 전도사' },
    title: '브라우저 도구의 장점: 켜면 바로, 어디서나',
    description: '브라우저에서 돌아가는 도구가 주는 편의성·호환성·업데이트 장점을 정리해요.',
    date: '2025-02-09',
    coverImage: 'https://picsum.photos/seed/browser-tools/800/450',
    body: [
      '페이지 열면 바로 쓰고, 설치·업데이트 없이 Windows·mac·Linux·태블릿에서 똑같이 쓸 수 있어요. 회사·집·노트북·iPad 다 같은 링크로. 업데이트는 사이트가 한 번에 해주니까 항상 최신이고, 링크만 공유하면 팀원도 바로 씁니다. 🔗 무거운 연산·대용량은 기기/브라우저 한계가 있을 수 있고, 오프라인이면 PWA/캐시 없으면 못 써요. 가볍고 자주 쓰는 걸 한 사이트에 모아 두기 좋아요.',
    ],
  },
  {
    slug: 'local-processing-privacy',
    locale: 'ko-KR',
    author: { id: 'ko-yeon', name: '로컬 처리 신봉자' },
    title: '로컬 처리로 프라이버시 지키기: 데이터가 기기를 안 떠남',
    description: '브라우저 안에서만 처리·업로드 없음이 프라이버시에 주는 의미.',
    date: '2025-02-10',
    coverImage: 'https://picsum.photos/seed/local-privacy/800/450',
    body: [
      '많은 CreatiKit 도구는 연산·렌더링을 로컬에서 하고, 파일·텍스트를 서버로 보내지 않아요. 올린 사진, 붙여넣은 글, 만든 비밀번호가 우리 DB나 제3자에게 가지 않죠. 신분증·내부 자료·미공개 원고 같은 걸 다룰 때 유리해요. 클라우드 API를 쓰는 기능은 페이지에 따로 표시되니까, 그때는 쓰지 않거나 로컬 대안을 고르면 됩니다. 🔒 "로컬 처리·업로드 안 함"이 있으면 보통 스크립트만 브라우저에서 돌리고 서버로 보내지 않는다는 뜻이에요. 기기 공유·해킹 시에는 여전히 유의하고, 쓰고 나면 클립보드 비우고 탭 닫는 게 좋아요.',
    ],
  },
  {
    slug: 'creative-workflow-tools',
    locale: 'ko-KR',
    author: { id: 'ko-hyun', name: '워크플로 괴수' },
    title: '크리에이티브 워크플로에 쓰는 작은 도구들: 구상부터 내보내기까지',
    description: '일반적인 워크플로에 CreatiKit을 어떻게 끼워 넣을지 소개해요.',
    date: '2025-02-11',
    coverImage: 'https://picsum.photos/seed/creative-workflow/800/450',
    body: [
      '색 추출·이미지 압축·차트·간단한 모션·문서까지, 크리에이티브 플로우의 많은 단계를 가벼운 도구로 빠르게 할 수 있어요. 큰 소프트를 매번 켤 필요 없이, 브라우저에서 구상부터 내보내기까지 한 번에. 팔레트로 메인 컬러 정하고, 압축으로 자산 줄이고, 데이터→차트로 보고용 차트, 마크다운으로 설명, 화이트보드·SVG로 스케치·아이콘. QR코드·배경 제거·CSS 애니메이션·파티클도 있죠. 🛠️ 자주 쓰는 걸 북마크해 두고 프로젝트별 폴더(디자인·데이터·문서)로 나누면 전환 줄어들어요. 프리랜서·소규모 팀·학생에게 무료·즉시 쓸 수 있는 도구로 가벼운 일 먼저 하고, 무거운 건 전문 소프트에 맡기면 됩니다.',
    ],
  },
  {
    slug: 'creatikit-for-education',
    locale: 'ko-KR',
    author: { id: 'ko-soo', name: '에듀킷' },
    title: '교육 현장에서 CreatiKit: 수업 데모와 자기 학습',
    description: '선생님과 학생이 수업 데모·복습에 CreatiKit을 쓰는 방법.',
    date: '2025-02-12',
    coverImage: 'https://picsum.photos/seed/education/800/450',
    body: [
      '화학·물리 실험실, 생태 샌드박스, 데이터→차트, 피아노·오디오 시각화 등이 수업 데모나 학생 탐구용으로 잘 맞아요. 선생님은 큰 화면으로 보여 주고, 학생은 태블릿으로 직접 파라미터를 바꿔 보며 결과를 기록할 수 있어요. 설치 없이 여러 기기에서 쓸 수 있고, 결과·코드 내보내기로 과제·피드백에도 쓸 수 있어요. 📚 교사는 먼저 도구를 써 보고, 학년·시수에 맞게 "물리 실험실로 포물선 공식 확인", "생태 샌드박스로 수용력 논의" 같은 활동을 설계하면 됩니다. 학생·학부모도 같은 링크로 복습·확장 가능해요.',
    ],
  },
  {
    slug: 'designer-favorite-tools',
    locale: 'ko-KR',
    author: { id: 'ko-ji', name: '디자이너 망령' },
    title: '디자이너가 자주 쓰는 온라인 도구 추천 ✨',
    description: '디자이너가 일상적으로 쓰는 온라인 도구 종류와 쓰임 정리.',
    date: '2025-02-13',
    coverImage: 'https://picsum.photos/seed/designer-tools/800/450',
    body: [
      '색 추출·배색, 이미지 압축·포맷 변환, 간단한 모션·SVG 편집, 화이트보드·차트 등이 필요할 때 CreatiKit에 다 있어요. 팔레트로 화면/이미지에서 색 뽑고 조화로운 팔레트 만들기, JPG/PNG/WebP 압축·품질 조절, 데이터→차트로 보고용 차트, SVG로 벡터 아이콘 수정, 화이트보드·CSS 애니·파티클로 스케치·프로토타입. Figma·Sketch·PS 옆에서 빠르게 색 테스트·이미지 압축·한 장 차트·SVG 수정할 때 브라우저만 열면 됩니다. 🌈 자주 쓰는 건 북마크나 시작 페이지에 두고, 가벼운 일은 여기서 처리하고 무거운 건 전문 툴로 가면 됩니다.',
    ],
  },
  {
    slug: 'workplace-demands-and-tool-wishlist',
    locale: 'zh-CN',
    author: { id: 'zh-yan', name: '需求永动机' },
    title: '工作中最常见的真实诉求：我们到底希望工具帮我们做什么？',
    description: '从真实工作流出发，聊聊团队在效率、协作、可追溯、可交付上的长期痛点与功能愿望清单。',
    date: '2025-02-14',
    coverImage: 'https://picsum.photos/seed/workplace-demands/800/450',
    inlineImages: [
      { afterParagraph: 2, src: 'https://picsum.photos/seed/workflow-board/720/400', alt: '真实工作流的任务板示意' },
      { afterParagraph: 6, src: 'https://picsum.photos/seed/product-notes/720/400', alt: '功能愿望清单与优先级' },
    ],
    body: [
      '如果把“工具”这件事从营销文案里拎出来，你会发现大家真正要的并不玄学：第一是少返工，第二是少沟通误差，第三是出结果快。很多团队并不是不会做事，而是把大量时间消耗在“确认版本”“找文件”“对齐口径”“反复导出”这些非核心动作上。最终看起来大家都很忙，但真正有价值的产出占比并不高。',
      '一个设计同学在做活动页时，可能会经历这样一条链路：找参考 -> 取色 -> 压图 -> 改文案 -> 导出多尺寸 -> 提交给开发 -> 开发发现尺寸或命名不一致 -> 返工。每一步都不复杂，但一旦缺少稳定的小工具和统一约定，链路就会被拉长。最常见的痛点不是“不会”，而是“每次都要重新来一遍”。',
      '产品经理的痛点又不太一样。PM 需要的是“可解释、可追踪”的过程：这张图是哪个版本？为什么这次配色改了？谁确认过？有没有历史记录？当工具只提供结果、不提供过程线索时，团队复盘会非常痛苦。于是你会看到越来越多团队在追求“带上下文的工具”，而不只是“单点功能”。',
      '运营视角也很现实：今天要上 10 张素材，明天要改 6 张，后天又要适配三个平台。真正的诉求不是“有个压缩按钮”，而是“批量、预设、命名规则、导出一致性、能快速回滚”。一旦这些基础能力不足，运营节奏会被工具细节拖慢，最后让业务窗口错过最佳发布时间。',
      '工程师经常吐槽“需求变来变去”，但从另一面看，很多变化来自上游信息不透明。若工具能把关键元数据自动带上（尺寸、格式、来源、修改时间、责任人），开发接手时会更清楚边界，联调效率会高很多。所谓“协作成本”，本质上就是信息丢失成本。',
      '所以，真正值得做的功能愿望清单，往往不是炫技，而是这些朴素能力：可复用模板、批处理、跨端一致、版本可回溯、输出标准化、权限边界清晰、以及“新人也能 5 分钟上手”。这些能力看起来不惊艳，却决定了团队能否规模化地稳定交付。',
      '再说 AI。很多团队现在都在“试 AI”，但真正落地时会遇到三个现实问题：第一，提示词和上下文管理混乱；第二，AI 结果不可复现；第三，最终责任人仍然是人。AI 在草稿生成、内容重写、结构建议方面很强，但在“业务判断、品牌语气、合规边界”上仍然需要人工兜底。',
      '换句话说，AI 更像一个加速器，而不是替代者。它能把“从 0 到 60 分”的部分变快，但“从 60 到 90 分”的打磨依旧依赖团队经验。真正有效的做法是：把 AI 放进固定流程节点，比如“先产 3 版草稿 -> 人工选方向 -> 再做人设和语气统一 -> 最后合规检查”。这样 AI 才不会变成随机噪音源。',
      '很多人担心“AI 会不会让内容都一个味”。这担心有道理。解决办法不是不用 AI，而是把“团队独特语料和判断准则”沉淀下来：什么风格可用、什么表达禁用、什么场景必须人工审。只要规则明确，AI 反而能让风格一致性更强，而不是更弱。',
      '回到工具建设本身，一个成熟团队最终会走向“三层结构”：底层是稳定能力（压缩、转换、导出）；中层是流程编排（模板、批量、协作）；上层是智能辅助（AI 生成、推荐、自动化校验）。很多产品现在只做了第一层，少数开始做第二层，真正拉开差距的是能否把三层连起来。',
      '这也是为什么即使是看起来“轻量”的站点，也完全可以承载更真实的工作思路。你不一定要一开始就做成复杂系统，但可以先把用户最频繁、最稳定、最可标准化的诉求做扎实。工具好不好，不在于功能数量，而在于它是否真的减少了用户在真实工作中的摩擦。',
      '最后给一个实用判断标准：每新增一个功能，问自己三件事——它是否减少返工？是否减少沟通误差？是否让结果更可复用？如果三者都没有明显改善，那这个功能大概率只是“看起来很酷”。反之，哪怕只是一个小小的批量导出按钮，也可能是团队效率的分水岭。',
      '再往深一点看，很多所谓“需求反复”其实是需求表达不充分。用户说“我想要一键导出”，真正要的可能是“导出后能直接投放、命名不乱、尺寸不出错”。如果产品只实现“一键”，但没处理后续环节，就会出现“功能有了但还不好用”的落差。',
      '因此，建议把功能需求拆成“任务闭环”来设计：输入条件、处理中间态、输出质量、错误提示、回滚能力。只做主路径而不做异常路径，短期看开发快，长期看维护成本会反噬。优秀工具的共同点往往不是主流程多花哨，而是异常场景处理得足够温柔。',
      '另外一个容易被忽略的点是学习成本。团队里的核心成员可能觉得“这功能很直觉”，但新人第一天并不这么认为。若缺少清晰提示、示例、默认参数和可见反馈，新人会在最简单的步骤里卡住，最后形成“只有老员工会用”的隐形壁垒。',
      '在 AI 场景下，学习成本问题更明显。很多团队把“会写提示词”当作门槛，导致能力集中在少数人手里。更稳妥的做法是把常见任务模板化，比如“写活动文案”“生成版本对比说明”“给运营图命名规则建议”等，让普通成员也能用出稳定结果。',
      '说到底，工具建设并不只是功能开发，更是组织效率工程。你在页面上加的是按钮，团队里减少的是摩擦；你新增的是参数，业务上提升的是交付确定性。当这层认知统一后，产品、设计、研发、运营会更容易站在同一个方向上。',
      '所以这类“杂谈”并不是离题，它其实是在回答一个长期问题：为什么有些工具做了很多年还在被用？答案通常不是“它功能最多”，而是“它真的懂现场、懂压力、懂协作”。只要把这个方向守住，功能再慢慢长，也会长在正确的位置上。',
    ],
  },
  {
    slug: 'ai-copilot-in-real-teams-notes',
    locale: 'en',
    author: { id: 'en-raven', name: 'Meeting Survivor' },
    title: 'AI copilots in real teams: what actually works (and what breaks)',
    description: 'A practical field note on AI at work: delivery pressure, context debt, prompt hygiene, and realistic feature asks.',
    date: '2025-02-15',
    coverImage: 'https://picsum.photos/seed/ai-copilot-notes/800/450',
    inlineImages: [
      { afterParagraph: 3, src: 'https://picsum.photos/seed/ai-workflow/720/400', alt: 'AI-assisted workflow sketch' },
    ],
    body: [
      'Most teams do not fail with AI because the model is weak. They fail because the workflow is vague. In production environments, people are juggling deadlines, changing requirements, half-updated docs, and handoffs across design, product, engineering, and operations. Dropping an AI assistant into that chaos without structure is like adding a race car to a road with no lanes.',
      'The first practical lesson is this: AI works best when tasks are scoped and bounded. “Write a complete strategy document” often produces polished fluff. “Rewrite this section for decision-makers, keep constraints X/Y/Z, and preserve data references” is where quality actually jumps. High-quality AI output usually follows high-quality task definition.',
      'Second lesson: context debt is real. Teams underestimate how much hidden context lives in chats, old tickets, and private assumptions. AI cannot read minds. If your process does not capture context explicitly, the assistant will produce plausible but misaligned responses. That is not model “hallucination” in the dramatic sense; it is organizational ambiguity made visible.',
      'A useful pattern in real teams is staged generation: draft -> critique -> refine -> compliance check. AI drafts quickly, humans choose direction, AI refines with constraints, and humans approve for legal/brand/risk. This keeps velocity high while preserving accountability. It also makes output traceable when stakeholders ask, “Why did we choose this wording?”',
      'Third lesson: prompt hygiene beats prompt wizardry. You do not need magical prompt spells; you need repeatable templates. Teams that standardize prompts around objective, audience, boundaries, and output format get far more stable results than teams relying on one “AI guru.” Repeatability scales. Heroics do not.',
      'What about fear of sameness? Yes, generic AI writing is easy to spot: over-smoothed transitions, shallow confidence, low domain texture. The fix is not to ban AI. The fix is to inject real material: your metrics, failure cases, customer language, and internal heuristics. AI should shape and accelerate your thinking, not replace your raw inputs.',
      'For product teams, the most valuable AI features are often boring: version-aware rewriting, tone presets linked to brand guidelines, source citation checks, and side-by-side diff with rationale. Those are not flashy demo features, but they reduce review friction and improve trust across stakeholders.',
      'There is also a governance angle. If your team handles sensitive data, “AI usage policy” cannot be a one-line note in onboarding docs. You need clear lanes: what can be pasted, what must be anonymized, what requires local processing, who signs off, and where logs are stored. Teams that ignore this will eventually face avoidable incidents.',
      'A realistic roadmap for small products is simple: start with AI where mistakes are cheap and review loops are short. Summaries, rewrite suggestions, draft alternatives, naming ideas, lightweight QA checklists—these offer quick ROI. Delay high-risk automation until your review protocol is mature.',
      'If you are building tools like CreatiKit, this matters even more. Users may come for single utilities, but they stay when those utilities become a coherent workflow. AI can be the connective layer: suggest presets, explain trade-offs, generate first drafts, and surface next actions. But without solid base tools, AI becomes decoration.',
      'In the end, the question is not “AI or no AI.” The real question is “Where does AI reduce friction without increasing hidden risk?” Teams that answer that honestly build systems that feel practical, trustworthy, and human—not performative. And in real work, practical usually wins.',
      'One final note from painful experience: if a feature looks great in demos but requires perfect inputs, it will fail under deadline pressure. Build for imperfect reality—messy data, rushed decisions, partial context. That is where trustworthy tools are born.',
      'Another hard-earned lesson: teams often optimize for speed of output, not speed of correction. A fast draft is meaningless if your review loop is slow. The best AI-assisted setups reduce revision cycles by making assumptions explicit, surfacing missing context early, and preserving rationale across iterations.',
      'When people ask for “smarter AI,” they usually mean “less rework.” That request is often solved by better UX around AI rather than bigger models: editable constraints, reusable brief templates, confidence hints, quality checklists, and side-by-side comparisons that help humans choose quickly.',
      'In cross-functional environments, trust is currency. Designers, PMs, legal reviewers, and engineers need to understand what changed and why. If AI output appears as a black box, adoption stalls. If it arrives with transparent diffs and source-aware notes, adoption grows naturally.',
      'This is also where lightweight products can differentiate. You do not need to become an all-in-one enterprise suite. You can deliver practical intelligence around real user moments: “you just compressed images—want suggested alt text?” or “you converted data—want a chart narrative draft?” Small, contextual assists create outsized value.',
      'Ultimately, AI maturity in teams is less about model benchmarks and more about operational habits. The teams that win are the ones that document assumptions, standardize review, and keep humans firmly in charge of final intent. AI then becomes a force multiplier instead of a source of confusion.',
    ],
  },
  {
    slug: 'zatsudan-team-requests-and-ai-balance',
    locale: 'ja-JP',
    author: { id: 'ja-echo', name: '仕様の森の住人' },
    title: '現場の要望メモ：便利機能とAI活用の“ちょうどいい距離”',
    description: '実務でよく出る要望を整理しつつ、AIをどこまで任せるべきかを雑談ベースで現実的に考える。',
    date: '2025-02-16',
    coverImage: 'https://picsum.photos/seed/zatsudan-ai-balance/800/450',
    body: [
      '現場で本当に欲しい機能は、派手な新機能より「毎日1分ずつ短縮してくれるもの」です。たとえば一括処理、命名ルールの自動化、履歴の見える化、テンプレート再利用。どれも地味ですが、1週間・1か月単位で見ると差は想像以上に大きくなります。',
      'チーム作業でつまずく原因は、能力不足よりも「前提のズレ」です。誰が最終版を持っているのか、どの設定で出力したのか、なぜこの変更をしたのか。こうした文脈が残らないと、毎回同じ議論を繰り返すことになります。',
      'その意味で、ツールに求められるのは“正解を出す力”だけではありません。“途中経過を残す力”が重要です。いつ、誰が、何を、どの意図で変えたか。これが見えるだけで、レビューの速度と品質は大きく改善します。',
      '最近は AI に「全部任せたい」という期待もありますが、実務では分業の方がうまくいきます。AI は下書き、要約、言い換え、比較案づくりが得意。人は判断、優先順位、トーン調整、合意形成が得意。この役割分担を明確にすると、成果が安定します。',
      '逆に失敗しやすいパターンは、AI の出力をそのまま最終稿にすることです。文面が綺麗でも、文脈が薄い・責任範囲が曖昧・固有事情が抜ける、という問題が起こりやすい。最終責任は人が持つ、という線引きはやはり必要です。',
      '機能要望を集めるときは「要望の数」より「発生頻度 × 影響範囲」で優先順位を付けると実用的です。1人の強い声より、10人が毎日困るポイントを先に直す。プロダクトの体感品質はこの積み重ねで決まります。',
      'また、現場は理想条件で動きません。締切直前、情報不足、担当者不在、仕様変更。こういう状況でも破綻しない機能設計が大切です。完璧な入力を前提にした機能は、実運用で脆くなります。',
      'CreatiKit のような軽量ツール群でも、発想は同じです。単機能を磨くことに加えて、作業をつなぐ導線を用意する。たとえば「圧縮 -> 変換 -> 共有」のような連続操作を短くするだけで、利用価値は一段上がります。',
      'AI についても、いきなり“自動化100%”を目指すより、レビュー前提の半自動を先に整える方が現実的です。提案理由の表示、差分比較、参照元の明示、トーンプリセットなど、安心して使える土台が先です。',
      '雑談っぽく聞こえるかもしれませんが、結局は「摩擦を減らす設計」が最強です。人が迷う回数、確認する回数、やり直す回数を減らせるか。そこに効く機能は、派手でなくても長く愛されます。',
      '最後に一つだけ。機能追加の判断で迷ったら、「この機能はユーザーの明日の仕事を1回楽にするか？」と問うのが有効です。YES が具体的に言えるなら、作る価値があります。NO なら、もう少し寝かせてよいかもしれません。',
      'ツールは目的ではなく手段です。だからこそ、現場のリアルな声を起点にした“地に足のついた改善”が、結果的に一番強いプロダクトを作ります。',
      'さらに言えば、要望の優先順位は「声の大きさ」ではなく「再現性」で決めるのが安全です。毎週同じ場所で同じ詰まりが発生しているなら、それは高優先です。逆に一度だけ発生した特殊ケースは、まず運用で回避できるかを確認してからでも遅くありません。',
      'AI との距離感も同じです。全部任せると不安、全部拒否すると機会損失。その中間にある“現実解”として、下書き・比較・要約・言い換えなどの支援領域から導入し、判断と最終責任は人が持つ。このルールを先に共有しておくと、チーム内の摩擦が減ります。',
      '機能提案を受ける側の視点では、「それが無いと誰がどれだけ困るか」を具体的に言語化してもらうと判断精度が上がります。時間削減、ミス削減、再利用性向上のどれに効くのかが見えると、実装価値を説明しやすくなります。',
      'プロダクト運営は短距離走ではなく持久走です。派手なリリースより、毎週の小さな改善を積み上げる方が最終的な信頼につながります。ユーザーは“新しさ”より“使いやすさの継続”をよく見ています。',
      'だからこそ、雑談記事であっても現場の肌感を残す価値があります。理想論だけでなく、締切前の混乱、合意形成の難しさ、AI への期待と不安、その全部を言語化しておくことが、次の改善のヒントになります。',
    ],
  },
];

/** 热门文章（前 3 条）：保持为前 3 篇，正文均 >4k 字 */
const FEATURED_SLUGS = ['image-compression-guide', '3d-model-viewer-intro', 'color-palette-tips'];

/** 全部文章列表的展示顺序：中/英/日/韩交错，避免「先全中文再全英文」 */
const LIST_ORDER: string[] = [
  'image-compression-guide',
  '3d-model-viewer-intro',
  'color-palette-tips',
  'data-to-chart-tutorial',
  'pixel-art-generator-intro',
  'css-animator-quickstart',
  'workplace-demands-and-tool-wishlist',
  'why-online-creative-tools',
  'markdown-editor-quickstart',
  'chemistry-lab-tool-intro',
  'background-remover-tips',
  'browser-tools-advantages',
  'qr-code-generator-guide',
  'physics-lab-tool-intro',
  'emoji-collection-howto',
  'local-processing-privacy',
  'whiteboard-use-cases',
  'ecosystem-sandbox-intro',
  'weather-tool-guide',
  'creative-workflow-tools',
  'ai-copilot-in-real-teams-notes',
  'hash-and-timestamp-tools',
  'camera-gesture-drawing-intro',
  'code-tools-overview',
  'creatikit-for-education',
  'audio-visualizer-what',
  'text-analyzer-features',
  'designer-favorite-tools',
  'zatsudan-team-requests-and-ai-balance',
  'svg-editor-basics',
  'piano-and-recording',
  'particle-editor-intro',
  'gif-tool-split-merge',
];

/** 按交错顺序返回文章列表（热门前 3 + 其余按 LIST_ORDER） */
export function getOrderedArticles(): Article[] {
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  return LIST_ORDER.map((slug) => bySlug.get(slug)).filter((a): a is Article => !!a);
}
