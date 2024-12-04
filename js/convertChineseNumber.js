function convertChineseNumberPart(text) {
    if (text == "零" || text == "〇") {
        return "0";
    }

    const numMap = {
        "零": 0, "〇": 0, "两": 2, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5,
        "六": 6, "七": 7, "八": 8, "九": 9, "壹": 1, "贰": 2, "叁": 3, "肆": 4,
        "伍": 5, "陆": 6, "柒": 7, "捌": 8, "玖": 9, "貳": 2, "廿": 20, "卅": 30,
        "卌": 40, "圩": 50, "圆": 60, "进": 70, "枯": 80, "枠": 90
    };

    const rankMap = {
        "十": 10, "百": 100, "千": 1000, "万": 10000, "亿": 100000000,
        "拾": 10, "佰": 100, "仟": 1000, "兆": Math.pow(10, 16)
    };

    let gen = [];
    let lastRank = 1;

    if (text[0] in rankMap) {
        gen.push({ type: "number", value: 1 });
    }

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        // 计算从右往左的位置
        const posFromRight = text.length - i;
        if (c in numMap) {
            if (numMap[c] === 0) {
                if (gen.length && gen[gen.length - 1].type === "number") {
                    console.log()
                    gen.push({ type: "rank", value: Math.pow(10, posFromRight) });
                }
                gen.push({ type: "zero" });
            } else {
                if (gen.length && gen[gen.length - 1].type === "number") {
                    gen.push({ type: "rank", value: Math.pow(10, posFromRight) });
                }
                gen.push({ type: "number", value: numMap[c] });
            }
        }

        if (c in rankMap) {
            lastRank = rankMap[c];
            if (gen.length && gen[gen.length - 1].type === "rank") {
                if (gen.length > 1 &&
                    gen[gen.length - 1].value === 10 &&
                    gen[gen.length - 2].type === "zero") {
                    gen[gen.length - 1].type = "number";
                    gen.push({ type: "rank", value: rankMap[c] });
                } else {
                    gen[gen.length - 1].value *= rankMap[c];
                }
                continue;
            }
            gen.push({ type: "rank", value: rankMap[c] });
        }
    }

    if (gen.length > 1) {
        if (gen[gen.length - 1].type === "number" && gen[gen.length - 2].type === "rank") {
            gen.push({ type: "rank", value: Math.floor(gen[gen.length - 2].value / 10) });
        }
    }

    if (!gen.length) return text;

    gen.reverse();
    gen.push({ type: "complete" });

    let block = [];
    let levelRank = 1;
    let currentRank = 1;

    for (let o of gen) {
        if (o.type === "number") {
            if (!block.length) block.push([]);
            block[block.length - 1].push(o.value * currentRank);
        }

        if (o.type === "rank") {
            let rank = o.value;
            if (!block.length) {
                levelRank = rank;
                currentRank = rank;
                block.push([]);
                continue;
            }

            if (rank > levelRank) {
                levelRank = rank;
                currentRank = rank;
                block[block.length - 1] = block[block.length - 1].reduce((a, b) => a + b, 0);
                block.push([]);
            } else {
                currentRank = rank * levelRank;
                block[block.length - 1] = block[block.length - 1].reduce((a, b) => a + b, 0);
                block.push([]);
            }
        }

        if (o.type === "complete" && block.length && Array.isArray(block[block.length - 1])) {
            block[block.length - 1] = block[block.length - 1].reduce((a, b) => a + b, 0);
        }
    }

    if (!block.length) return text;

    return block.reduce((a, b) => a + b, 0).toString();
}

function convertChineseNumber(s) {

    try {
        return s.replace(/[零〇两一二三四五六七八九壹贰叁肆伍陆柒捌玖貳廿卅卌圩圆进枯枠十百千万亿拾佰仟兆]+/g, match => {
            return this.convertChineseNumberPart(match);
        })

    } catch (e) {
        return s;
    }

}