// 正文里的图示（components/Fig.astro 画）。每张图一个 id，MDX 里写 <Fig id="…" />。
//   type：画法（compare 两条路对比、term 终端、folder 文件夹、anatomy 一句话拆成几块、stack 分层、
//         flow 几步流程、night 一夜、ladder 由强到弱、fan 几个模型挑刺、tree 一个带几个）
//   base：和语言无关的部分（图标、命令、哪一步要你开口……；term 图的窗口标题写 base.app）
//   zh：文字（以后加英文就加一份 en）。
// 写图里的字：短，一格一件事；不重复正文的整句（见 MAINTAINING.md）。
// 每种画法要的字段，看 components/Fig.astro 里对应的那一段。
export const FIG_UI = {
  zh: { label: "图示", replay: "再看一遍" },
  en: { label: "Diagram", replay: "Replay" },
};

export const FIGS = {};
