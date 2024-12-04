
## 开发思路

### 中文数字变为英文数字思路

**关键映射表**:

中文数字分为数字和数位

```javascript
const numMap = {
    "零": 0, "一": 1, "二": 2, ... // 中文数字到阿拉伯数字的映射
};

const rankMap = {
    "十": 10, "百": 100, "千": 1000, ... // 中文数位到具体数值的映射
};
```

**转换过程**:

1. 首先将中文数字字符串解析成一系列标记（token），每个标记有类型（type）和值（value）：

    * "number": 表示数字
    * "rank": 表示数位（十、百、千等）
    * "zero": 表示零
    * "complete": 表示结束
2. 然后将这些标记转换成最终的数值，处理以下情况：

    * 处理"一十"这样的特殊情况
    * 处理数位（十、百、千等）的累乘
    * 处理零的特殊情况
    * 处理大数位（万、亿等）的分块计算

**示例**:

```javascript
// "一千二百三十四" 的处理过程：
// 1. 解析成标记：[1]-[千]-[2]-[百]-[3]-[十]-[4]
// 2. 计算结果：1000 + 200 + 30 + 4 = 1234
```

### 中文章节排序思路

把字符串中的中文数字用正则先提取出来，每个提取的中文数字变为英文数字后，再进行自然排序


## JS 中文章节转数字进行排序

### 函数

```js
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
        gen.push({type: "number", value: 1});
    }

   for (let i = 0; i < text.length; i++) {
        const c = text[i];
        // 计算从右往左的位置
        const posFromRight = text.length - i;
        if (c in numMap) {
            if (numMap[c] === 0) {
                if (gen.length && gen[gen.length-1].type === "number") {
                    console.log()
                    gen.push({type: "rank", value: Math.pow(10, posFromRight)});
                }
                gen.push({type: "zero"});
            } else {
                if (gen.length && gen[gen.length-1].type === "number") {
                    gen.push({type: "rank", value: Math.pow(10, posFromRight)});
                }
                gen.push({type: "number", value: numMap[c]});
            }
        }

        if (c in rankMap) {
            lastRank = rankMap[c];
            if (gen.length && gen[gen.length-1].type === "rank") {
                if (gen.length > 1 && 
                    gen[gen.length-1].value === 10 && 
                    gen[gen.length-2].type === "zero") {
                    gen[gen.length-1].type = "number";
                    gen.push({type: "rank", value: rankMap[c]});
                } else {
                    gen[gen.length-1].value *= rankMap[c];
                }
                continue;
            }
            gen.push({type: "rank", value: rankMap[c]});
        }
    }

    if (gen.length > 1) {
        if (gen[gen.length-1].type === "number" && gen[gen.length-2].type === "rank") {
            gen.push({type: "rank", value: Math.floor(gen[gen.length-2].value / 10)});
        }
    }

    if (!gen.length) return text;

    gen.reverse();
    gen.push({type: "complete"});

    let block = [];
    let levelRank = 1;
    let currentRank = 1;

    for (let o of gen) {
        if (o.type === "number") {
            if (!block.length) block.push([]);
            block[block.length-1].push(o.value * currentRank);
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
                block[block.length-1] = block[block.length-1].reduce((a, b) => a + b, 0);
                block.push([]);
            } else {
                currentRank = rank * levelRank;
                block[block.length-1] = block[block.length-1].reduce((a, b) => a + b, 0);
                block.push([]);
            }
        }

        if (o.type === "complete" && block.length && Array.isArray(block[block.length-1])) {
            block[block.length-1] = block[block.length-1].reduce((a, b) => a + b, 0);
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
```

### 测试中文数字转数字

```js
const testPair = [
   [ 0,"零" ],
    [ 1,"一" ],
    [ 2,"二" ],
    [ 3,"三" ],
    [ 4,"四" ],
    [ 5,"五" ],
    [ 6,"六" ],
    [ 7,"七" ],
    [ 8,"八" ],
    [ 9,"九" ],
    [ 10,"一十" ],
    [ 11,"一十一" ],
    [ 110,"一百一十" ],
    [ 111,"一百一十一" ],
    [ 100,"一百" ],
    [ 102,"一百零二" ],
    [ 1020,"一千零二十" ],
    [ 1001,"一千零一" ],
    [ 1015,"一千零一十五" ],
    [ 1000,"一千" ],
    [ 10000,"一万" ],
    [ 20010,"二万零一十" ],
    [ 20001,"二万零一" ],
    [ 100000,"一十万" ],
    [ 1000000,"一百万" ],
    [ 10000000,"一千万" ],
    [ 100000000,"一亿" ],
    [ 1000000000,"一十亿" ],
    [ 1000001000,"一十亿零一千" ],
    [ 1000000100,"一十亿零一百" ],
    [ 200010,"二十万零一十" ],
    [ 2000105,"二百万零一百零五" ],
    [ 20001007,"二千万一千零七" ],
    [ 2000100190,"二十亿零一十万零一百九十" ],
    [ 1040010000,"一十亿四千零一万" ],
    [ 200012301,"二亿零一万二千三百零一" ],
    [ 2005010010,"二十亿零五百零一万零一十" ],
    [ 4009060200,"四十亿零九百零六万零二百" ],
    [ 4294967295,"四十二亿九千四百九十六万七千二百九十五" ],
    // 电话号码转化
    [ 110,"一一零" ],
    [ 12306,"一二三零六" ],

]

//  测试用例
function  testChineseToNumber()
{
    for(let i = 0; i < testPair.length; i++)
    {
        let  num = convertChineseNumber(testPair[i][1]);
        console.log(`${testPair[i][1]} -> ${num}, ${num == testPair[i][0]}`,);
    }
}
testChineseToNumber()
```

结果：无论是数字还是电话号码，都能正确转化为阿拉伯数字

> 零 -> 0, true  
> 一 -> 1, true  
> 二 -> 2, true  
> 三 -> 3, true  
> 四 -> 4, true  
> 五 -> 5, true  
> 六 -> 6, true  
> 七 -> 7, true  
> 八 -> 8, true  
> 九 -> 9, true  
> 一十 -> 10, true  
> 一十一 -> 11, true  
> 一百一十 -> 110, true  
> 一百一十一 -> 111, true  
> 一百 -> 100, true  
> 一百零二 -> 102, true  
> 一千零二十 -> 1020, true  
> 一千零一 -> 1001, true  
> 一千零一十五 -> 1015, true  
> 一千 -> 1000, true  
> 一万 -> 10000, true  
> 二万零一十 -> 20010, true  
> 二万零一 -> 20001, true  
> 一十万 -> 100000, true  
> 一百万 -> 1000000, true  
> 一千万 -> 10000000, true  
> 一亿 -> 100000000, true  
> 一十亿 -> 1000000000, true  
> 一十亿零一千 -> 1000001000, true  
> 一十亿零一百 -> 1000000100, true  
> 二十万零一十 -> 200010, true  
> 二百万零一百零五 -> 2000105, true  
> 二千万一千零七 -> 20001007, true  
> 二十亿零一十万零一百九十 -> 2000100190, true  
> 一十亿四千零一万 -> 1040010000, true  
> 二亿零一万二千三百零一 -> 200012301, true  
> 二十亿零五百零一万零一十 -> 2005010010, true  
> 四十亿零九百零六万零二百 -> 4009060200, true  
> 四十二亿九千四百九十六万七千二百九十五 -> 4294967295, true  
> 一一零 -> 110, true  
> 一二三零六 -> 12306, true

### 测试中文章节排序

```js
// 测试数据字典
const testCases = {
    numeric: {
        name: '阿拉伯数字章节',
        data: ['第2章', '第10章', '第11章', '第6章', '第17章', '第18章', '第19章', 
               '第1章', '第7章', '第3章', '第4章', '第14章', '第9章', '第13章', 
               '第20章', '第12章', '第15章', '第8章', '第16章', '第5章']
    },
    chinese: {
        name: '中文数字章节',
        data: ['第二章', '第十章', '第十一章', '第六章', '第十七章', '第十八章', 
               '第十九章', '第一章', '第七章', '第三章', '第四章', '第十四章', 
               '第九章', '第十三章', '第二十章', '第十二章', '第十五章', '第八章', 
               '第十六章', '第五章']
    },
    traditional: {
        name: '繁体中文数字章节',
        data: ['第貳章', '第拾章', '第拾壹章', '第陆章', '第拾柒章', '第拾捌章', 
               '第拾玖章', '第壹章', '第柒章', '第叁章', '第肆章', '第拾肆章', 
               '第玖章', '第拾叁章', '第貳拾章', '第拾貳章', '第拾伍章', '第捌章', 
               '第拾陆章', '第伍章']
    },
    numeric2: {
        name: '阿拉伯数字带书名章节',
        data: [  '《xxx书》第2章', '《xxx书》第10章', '《xxx书》第11章', '《xxx书》第6章', '《xxx书》第17章',
  '《xxx书》第18章', '《xxx书》第19章', '《xxx书》第1章', '《xxx书》第7章', '《xxx书》第3章',
  '《xxx书》第4章', '《xxx书》第14章', '《xxx书》第9章', '《xxx书》第13章', '《xxx书》第20章',
  '《xxx书》第12章', '《xxx书》第15章', '《xxx书》第8章', '《xxx书》第16章', '《xxx书》第5章']
    },
    chinese2: {
        name: '中文数字带书名章节',
        data: [  '《xxx书》第二章', '《xxx书》第十章', '《xxx书》第十一章', '《xxx书》第六章', '《xxx书》第十七章',
  '《xxx书》第十八章', '《xxx书》第十九章', '《xxx书》第一章', '《xxx书》第七章', '《xxx书》第三章',
  '《xxx书》第四章', '《xxx书》第十四章', '《xxx书》第九章', '《xxx书》第十三章', '《xxx书》第二十章',
  '《xxx书》第十二章', '《xxx书》第十五章', '《xxx书》第八章', '《xxx书》第十六章', '《xxx书》第五章']
    },
    traditional2: {
        name: '繁体中文数字带书名章节',
        data: [    '《xxx书》第貳章', '《xxx书》第拾章', '《xxx书》第拾壹章', '《xxx书》第陆章', '《xxx书》第拾柒章',
  '《xxx书》第拾捌章', '《xxx书》第拾玖章', '《xxx书》第壹章', '《xxx书》第柒章', '《xxx书》第叁章',
  '《xxx书》第肆章', '《xxx书》第拾肆章', '《xxx书》第玖章', '《xxx书》第拾叁章', '《xxx书》第貳拾章',
  '《xxx书》第拾貳章', '《xxx书》第拾伍章', '《xxx书》第捌章', '《xxx书》第拾陆章', '《xxx书》第伍章']
    }
};

// 改进的测试函数
function testAndSort(testCase) {
    console.log(`\n=== 测试 ${testCase.name} ===`);
    console.log('原始顺序:');
    console.log(testCase.data);
  
    console.log('\n转换结果:');
    testCase.data.forEach(chapter => {
        console.log(`${chapter} -> ${convertChineseNumber(chapter)}`);
    });
  
    // 转换并排序
    let convertedStrings = testCase.data.map(chapter => convertChineseNumber(chapter));
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    convertedStrings.sort((a, b) => collator.compare(a, b));
  
    console.log('\n排序后:');
    console.log(convertedStrings);
}

// 运行所有测试
console.log('====== 开始测试 ======');

for (let key in testCases) {
    testAndSort(testCases[key]);
}

console.log('\n====== 测试完成 ======');

```

> ====== 开始测试 ======
>
> === 测试 阿拉伯数字章节 ===  
> 原始顺序:  
> ['第2章', '第10章', '第11章', '第6章', '第17章', '第18章', '第19章', '第1章', '第7章', '第3章', '第4章', '第14章', '第9章', '第13章', '第20章', '第12章', '第15章', '第8章', '第16章', '第5章']
>
> 排序后:  
> ['第1章', '第2章', '第3章', '第4章', '第5章', '第6章', '第7章', '第8章', '第9章', '第10章', '第11章', '第12章', '第13章', '第14章', '第15章', '第16章', '第17章', '第18章', '第19章', '第20章']
>
> === 测试 中文数字章节 ===  
> 原始顺序:  
> ['第二章', '第十章', '第十一章', '第六章', '第十七章', '第十八章', '第十九章', '第一章', '第七章', '第三章', '第四章', '第十四章', '第九章', '第十三章', '第二十章', '第十二章', '第十五章', '第八章', '第十六章', '第五章']
>
> 排序后:  
> ['第1章', '第2章', '第3章', '第4章', '第5章', '第6章', '第7章', '第8章', '第9章', '第10章', '第11章', '第12章', '第13章', '第14章', '第15章', '第16章', '第17章', '第18章', '第19章', '第20章']
>
> === 测试 繁体中文数字章节 ===  
> 原始顺序:  
> ['第貳章', '第拾章', '第拾壹章', '第陆章', '第拾柒章', '第拾捌章', '第拾玖章', '第壹章', '第柒章', '第叁章', '第肆章', '第拾肆章', '第玖章', '第拾叁章', '第貳拾章', '第拾貳章', '第拾伍章', '第捌章', '第拾陆章', '第伍章']
>
> 排序后:  
> ['第1章', '第2章', '第3章', '第4章', '第5章', '第6章', '第7章', '第8章', '第9章', '第10章', '第11章', '第12章', '第13章', '第14章', '第15章', '第16章', '第17章', '第18章', '第19章', '第20章']
>
> === 测试 阿拉伯数字带书名章节 ===  
> 原始顺序:  
> ['《xxx书》第2章', '《xxx书》第10章', '《xxx书》第11章', '《xxx书》第6章', '《xxx书》第17章', '《xxx书》第18章', '《xxx书》第19章', '《xxx书》第1章', '《xxx书》第7章', '《xxx书》第3章', '《xxx书》第4章', '《xxx书》第14章', '《xxx书》第9章', '《xxx书》第13章', '《xxx书》第20章', '《xxx书》第12章', '《xxx书》第15章', '《xxx书》第8章', '《xxx书》第16章', '《xxx书》第5章']
>
> 排序后:  
> ['《xxx书》第1章', '《xxx书》第2章', '《xxx书》第3章', '《xxx书》第4章', '《xxx书》第5章', '《xxx书》第6章', '《xxx书》第7章', '《xxx书》第8章', '《xxx书》第9章', '《xxx书》第10章', '《xxx书》第11章', '《xxx书》第12章', '《xxx书》第13章', '《xxx书》第14章', '《xxx书》第15章', '《xxx书》第16章', '《xxx书》第17章', '《xxx书》第18章', '《xxx书》第19章', '《xxx书》第20章']
>
> === 测试 中文数字带书名章节 ===  
> 原始顺序:  
> ['《xxx书》第二章', '《xxx书》第十章', '《xxx书》第十一章', '《xxx书》第六章', '《xxx书》第十七章', '《xxx书》第十八章', '《xxx书》第十九章', '《xxx书》第一章', '《xxx书》第七章', '《xxx书》第三章', '《xxx书》第四章', '《xxx书》第十四章', '《xxx书》第九章', '《xxx书》第十三章', '《xxx书》第二十章', '《xxx书》第十二章', '《xxx书》第十五章', '《xxx书》第八章', '《xxx书》第十六章', '《xxx书》第五章']
>
> 排序后:  
> ['《xxx书》第1章', '《xxx书》第2章', '《xxx书》第3章', '《xxx书》第4章', '《xxx书》第5章', '《xxx书》第6章', '《xxx书》第7章', '《xxx书》第8章', '《xxx书》第9章', '《xxx书》第10章', '《xxx书》第11章', '《xxx书》第12章', '《xxx书》第13章', '《xxx书》第14章', '《xxx书》第15章', '《xxx书》第16章', '《xxx书》第17章', '《xxx书》第18章', '《xxx书》第19章', '《xxx书》第20章']
>
> === 测试 繁体中文数字带书名章节 ===  
> 原始顺序:  
> ['《xxx书》第貳章', '《xxx书》第拾章', '《xxx书》第拾壹章', '《xxx书》第陆章', '《xxx书》第拾柒章', '《xxx书》第拾捌章', '《xxx书》第拾玖章', '《xxx书》第壹章', '《xxx书》第柒章', '《xxx书》第叁章', '《xxx书》第肆章', '《xxx书》第拾肆章', '《xxx书》第玖章', '《xxx书》第拾叁章', '《xxx书》第貳拾章', '《xxx书》第拾貳章', '《xxx书》第拾伍章', '《xxx书》第捌章', '《xxx书》第拾陆章', '《xxx书》第伍章']
>
> 排序后:  
> ['《xxx书》第1章', '《xxx书》第2章', '《xxx书》第3章', '《xxx书》第4章', '《xxx书》第5章', '《xxx书》第6章', '《xxx书》第7章', '《xxx书》第8章', '《xxx书》第9章', '《xxx书》第10章', '《xxx书》第11章', '《xxx书》第12章', '《xxx书》第13章', '《xxx书》第14章', '《xxx书》第15章', '《xxx书》第16章', '《xxx书》第17章', '《xxx书》第18章', '《xxx书》第19章', '《xxx书》第20章']
>
> ====== 测试完成 ======

## python 中文章节转数字进行排序

### 函数

```python
from natsort import natsorted


def convert_chinese_number_part(text):
    if text == "零" or text == "〇":
        return "0"
    num_map = {
        "零": 0,
        "〇": 0,
        "两": 2,
        "一": 1,
        "二": 2,
        "三": 3,
        "四": 4,
        "五": 5,
        "六": 6,
        "七": 7,
        "八": 8,
        "九": 9,
        "壹": 1,
        "贰": 2,
        "叁": 3,
        "肆": 4,
        "伍": 5,
        "陆": 6,
        "柒": 7,
        "捌": 8,
        "玖": 9,
        "貳": 2,
        "廿": 20,
        "卅": 30,
        "卌": 40,
        "圩": 50,
        "圆": 60,
        "进": 70,
        "枯": 80,
        "枠": 90,
    }

    rank_map = {
        "十": 10,
        "百": 100,
        "千": 1000,
        "万": 10000,
        "亿": 100000000,
        "拾": 10,
        "佰": 100,
        "仟": 1000,
        "兆": pow(10, 16),
    }

    gen = []

    if text[0] in rank_map:
        gen.append({"type": "number", "value": 1})

    for i in range(len(text)):
        c = text[i]
        post_from_right = len(text) - i

        if c in num_map:
            if num_map[c] == 0:
                if gen and gen[-1]["type"] == "number":
                    gen.append({"type": "rank", "value": 10**post_from_right})
                gen.append({"type": "zero"})
            else:
                if gen and gen[-1]["type"] == "number":
                    gen.append({"type": "rank", "value": 10**post_from_right})
                gen.append({"type": "number", "value": num_map[c]})

        if c in rank_map:
            if gen and gen[-1]["type"] == "rank":
                if (
                    len(gen) > 1
                    and gen[-1]["value"] == 10
                    and gen[-2]["type"] == "zero"
                ):
                    gen[-1]["type"] = "number"
                    gen.append({"type": "rank", "value": rank_map[c]})
                else:
                    gen[-1]["value"] *= rank_map[c]
                continue
            gen.append({"type": "rank", "value": rank_map[c]})

    if len(gen) > 1:
        if gen[-1]["type"] == "number" and gen[-2]["type"] == "rank":
            gen.append({"type": "rank", "value": gen[-2]["value"] // 10})

    if not gen:
        return text

    gen.reverse()
    gen.append({"type": "complete"})

    block = []
    level_rank = 1
    current_rank = 1

    for o in gen:
        if o["type"] == "number":
            if not block:
                block.append([])
            block[-1].append(o["value"] * current_rank)

        if o["type"] == "rank":
            rank = o["value"]
            if not block:
                level_rank = rank
                current_rank = rank
                block.append([])
                continue

            if rank > level_rank:
                level_rank = rank
                current_rank = rank
                block[-1] = sum(block[-1])
                block.append([])
            else:
                current_rank = rank * level_rank
                block[-1] = sum(block[-1])
                block.append([])

        if o["type"] == "complete" and block and isinstance(block[-1], list):
            block[-1] = sum(block[-1])

    if not block:
        return text

    return str(sum(block))


def convert_chinese_number(s):
    try:
        import re

        pattern = r"[零〇两一二三四五六七八九壹贰叁肆伍陆柒捌玖貳廿卅卌圩圆进枯枠十百千万亿拾佰仟兆]+"
        return re.sub(
            pattern, lambda match: convert_chinese_number_part(match.group()), s
        )
    except Exception:
        return s
```

> 零 -> 0, True  
> 一 -> 1, True  
> 二 -> 2, True  
> 三 -> 3, True  
> 四 -> 4, True  
> 五 -> 5, True  
> 六 -> 6, True  
> 七 -> 7, True  
> 八 -> 8, True  
> 九 -> 9, True  
> 一十 -> 10, True  
> 一十一 -> 11, True  
> 一百一十 -> 110, True  
> 一百一十一 -> 111, True  
> 一百 -> 100, True  
> 一百零二 -> 102, True  
> 一千零二十 -> 1020, True  
> 一千零一 -> 1001, True  
> 一千零一十五 -> 1015, True  
> 一千 -> 1000, True  
> 一万 -> 10000, True  
> 二万零一十 -> 20010, True  
> 二万零一 -> 20001, True  
> 一十万 -> 100000, True  
> 一百万 -> 1000000, True  
> 一千万 -> 10000000, True  
> 一亿 -> 100000000, True  
> 一十亿 -> 1000000000, True  
> 一十亿零一千 -> 1000001000, True  
> 一十亿零一百 -> 1000000100, True  
> 二十万零一十 -> 200010, True  
> 二百万零一百零五 -> 2000105, True  
> 二千万一千零七 -> 20001007, True  
> 二十亿零一十万零一百九十 -> 2000100190, True  
> 一十亿四千零一万 -> 1040010000, True  
> 二亿零一万二千三百零一 -> 200012301, True  
> 二十亿零五百零一万零一十 -> 2005010010, True  
> 四十亿零九百零六万零二百 -> 4009060200, True  
> 四十二亿九千四百九十六万七千二百九十五 -> 4294967295, True  
> 一一零 -> 110, True  
> 一二三零六 -> 12306, True

### 测试中文数字转数字

```js
test_pair = [
    [0, "零"],
    [1, "一"],
    [2, "二"],
    [3, "三"],
    [4, "四"],
    [5, "五"],
    [6, "六"],
    [7, "七"],
    [8, "八"],
    [9, "九"],
    [10, "一十"],
    [11, "一十一"],
    [110, "一百一十"],
    [111, "一百一十一"],
    [100, "一百"],
    [102, "一百零二"],
    [1020, "一千零二十"],
    [1001, "一千零一"],
    [1015, "一千零一十五"],
    [1000, "一千"],
    [10000, "一万"],
    [20010, "二万零一十"],
    [20001, "二万零一"],
    [100000, "一十万"],
    [1000000, "一百万"],
    [10000000, "一千万"],
    [100000000, "一亿"],
    [1000000000, "一十亿"],
    [1000001000, "一十亿零一千"],
    [1000000100, "一十亿零一百"],
    [200010, "二十万零一十"],
    [2000105, "二百万零一百零五"],
    [20001007, "二千万一千零七"],
    [2000100190, "二十亿零一十万零一百九十"],
    [1040010000, "一十亿四千零一万"],
    [200012301, "二亿零一万二千三百零一"],
    [2005010010, "二十亿零五百零一万零一十"],
    [4009060200, "四十亿零九百零六万零二百"],
    [4294967295, "四十二亿九千四百九十六万七千二百九十五"],
    # 电话号码转化
    [110, "一一零"],
    [12306, "一二三零六"],
]

def test_chinese_to_number():
    for pair in test_pair:
        num = convert_chinese_number(pair[1])  # 假设有一个convert_chinese_number函数
        print(f"{pair[1]} -> {num}, {num == str(pair[0])}")

# 运行测试
test_chinese_to_number()

```

### 测试中文章节排序

```js

def test_and_sort(test_case):
    print(f"\n=== 测试 {test_case['name']} ===")
    print('原始顺序:')
    print(test_case['data'])

    print('\n转换结果:')
    for chapter in test_case['data']:
        print(f"{chapter} -> {convert_chinese_number(chapter)}")

    # 转换并排序
    converted_strings = [convert_chinese_number(chapter) for chapter in test_case['data']]
    # 使用自然排序
    converted_strings = natsorted(converted_strings)

    print('\n排序后:')
    print(converted_strings)

test_cases = {
    'numeric': {
        'name': '阿拉伯数字章节',
        'data': ['第2章', '第10章', '第11章', '第6章', '第17章', '第18章', '第19章', 
               '第1章', '第7章', '第3章', '第4章', '第14章', '第9章', '第13章', 
               '第20章', '第12章', '第15章', '第8章', '第16章', '第5章']
    },
    'chinese': {
        'name': '中文数字章节',
        'data': ['第二章', '第十章', '第十一章', '第六章', '第十七章', '第十八章', 
               '第十九章', '第一章', '第七章', '第三章', '第四章', '第十四章', 
               '第九章', '第十三章', '第二十章', '第十二章', '第十五章', '第八章', 
               '第十六章', '第五章']
    },
    'traditional': {
        'name': '繁体中文数字章节',
        'data': ['第貳章', '第拾章', '第拾壹章', '第陆章', '第拾柒章', '第拾捌章', 
               '第拾玖章', '第壹章', '第柒章', '第叁章', '第肆章', '第拾肆章', 
               '第玖章', '第拾叁章', '第貳拾章', '第拾貳章', '第拾伍章', '第捌章', 
               '第拾陆章', '第伍章']
    },
    'numeric2': {
        'name': '阿拉伯数字带书名章节',
        'data': [  '《xxx书》第2章', '《xxx书》第10章', '《xxx书》第11章', '《xxx书》第6章', '《xxx书》第17章',
  '《xxx书》第18章', '《xxx书》第19章', '《xxx书》第1章', '《xxx书》第7章', '《xxx书》第3章',
  '《xxx书》第4章', '《xxx书》第14章', '《xxx书》第9章', '《xxx书》第13章', '《xxx书》第20章',
  '《xxx书》第12章', '《xxx书》第15章', '《xxx书》第8章', '《xxx书》第16章', '《xxx书》第5章']
    },
    'chinese2': {
        'name': '中文数字带书名章节',
        'data': [  '《xxx书》第二章', '《xxx书》第十章', '《xxx书》第十一章', '《xxx书》第六章', '《xxx书》第十七章',
  '《xxx书》第十八章', '《xxx书》第十九章', '《xxx书》第一章', '《xxx书》第七章', '《xxx书》第三章',
  '《xxx书》第四章', '《xxx书》第十四章', '《xxx书》第九章', '《xxx书》第十三章', '《xxx书》第二十章',
  '《xxx书》第十二章', '《xxx书》第十五章', '《xxx书》第八章', '《xxx书》第十六章', '《xxx书》第五章']
    },
    'traditional2': {
        'name': '繁体中文数字带书名章节',
        'data': [    '《xxx书》第貳章', '《xxx书》第拾章', '《xxx书》第拾壹章', '《xxx书》第陆章', '《xxx书》第拾柒章',
  '《xxx书》第拾捌章', '《xxx书》第拾玖章', '《xxx书》第壹章', '《xxx书》第柒章', '《xxx书》第叁章',
  '《xxx书》第肆章', '《xxx书》第拾肆章', '《xxx书》第玖章', '《xxx书》第拾叁章', '《xxx书》第貳拾章',
  '《xxx书》第拾貳章', '《xxx书》第拾伍章', '《xxx书》第捌章', '《xxx书》第拾陆章', '《xxx书》第伍章']
    }
};

print('====== 开始测试 ======')

for key, test_case in test_cases.items():
    test_and_sort(test_case)

print('\n====== 测试完成 ======')
```

> ====== 开始测试 ======
>
> === 测试 阿拉伯数字章节 ===  
> 原始顺序:  
> ['第2章', '第10章', '第11章', '第6章', '第17章', '第18章', '第19章', '第1章', '第7章', '第3章', '第4章', '第14章', '第9章', '第13章', '第20章', '第12章', '第15章', '第8章', '第16章', '第5章']
>
> 排序后:  
> ['第1章', '第2章', '第3章', '第4章', '第5章', '第6章', '第7章', '第8章', '第9章', '第10章', '第11章', '第12章', '第13章', '第14章', '第15章', '第16章', '第17章', '第18章', '第19章', '第20章']
>
> === 测试 中文数字章节 ===  
> 原始顺序:  
> ['第二章', '第十章', '第十一章', '第六章', '第十七章', '第十八章', '第十九章', '第一章', '第七章', '第三章', '第四章', '第十四章', '第九章', '第十三章', '第二十章', '第十二章', '第十五章', '第八章', '第十六章', '第五章']
>
> 排序后:  
> ['第1章', '第2章', '第3章', '第4章', '第5章', '第6章', '第7章', '第8章', '第9章', '第10章', '第11章', '第12章', '第13章', '第14章', '第15章', '第16章', '第17章', '第18章', '第19章', '第20章']
>
> === 测试 繁体中文数字章节 ===  
> 原始顺序:  
> ['第貳章', '第拾章', '第拾壹章', '第陆章', '第拾柒章', '第拾捌章', '第拾玖章', '第壹章', '第柒章', '第叁章', '第肆章', '第拾肆章', '第玖章', '第拾叁章', '第貳拾章', '第拾貳章', '第拾伍章', '第捌章', '第拾陆章', '第伍章']
>
> 排序后:  
> ['第1章', '第2章', '第3章', '第4章', '第5章', '第6章', '第7章', '第8章', '第9章', '第10章', '第11章', '第12章', '第13章', '第14章', '第15章', '第16章', '第17章', '第18章', '第19章', '第20章']
>
> === 测试 阿拉伯数字带书名章节 ===  
> 原始顺序:  
> ['《xxx书》第2章', '《xxx书》第10章', '《xxx书》第11章', '《xxx书》第6章', '《xxx书》第17章', '《xxx书》第18章', '《xxx书》第19章', '《xxx书》第1章', '《xxx书》第7章', '《xxx书》第3章', '《xxx书》第4章', '《xxx书》第14章', '《xxx书》第9章', '《xxx书》第13章', '《xxx书》第20章', '《xxx书》第12章', '《xxx书》第15章', '《xxx书》第8章', '《xxx书》第16章', '《xxx书》第5章']
>
> 排序后:  
> ['《xxx书》第1章', '《xxx书》第2章', '《xxx书》第3章', '《xxx书》第4章', '《xxx书》第5章', '《xxx书》第6章', '《xxx书》第7章', '《xxx书》第8章', '《xxx书》第9章', '《xxx书》第10章', '《xxx书》第11章', '《xxx书》第12章', '《xxx书》第13章', '《xxx书》第14章', '《xxx书》第15章', '《xxx书》第16章', '《xxx书》第17章', '《xxx书》第18章', '《xxx书》第19章', '《xxx书》第20章']
>
> === 测试 中文数字带书名章节 ===  
> 原始顺序:  
> ['《xxx书》第二章', '《xxx书》第十章', '《xxx书》第十一章', '《xxx书》第六章', '《xxx书》第十七章', '《xxx书》第十八章', '《xxx书》第十九章', '《xxx书》第一章', '《xxx书》第七章', '《xxx书》第三章', '《xxx书》第四章', '《xxx书》第十四章', '《xxx书》第九章', '《xxx书》第十三章', '《xxx书》第二十章', '《xxx书》第十二章', '《xxx书》第十五章', '《xxx书》第八章', '《xxx书》第十六章', '《xxx书》第五章']
>
> 排序后:  
> ['《xxx书》第1章', '《xxx书》第2章', '《xxx书》第3章', '《xxx书》第4章', '《xxx书》第5章', '《xxx书》第6章', '《xxx书》第7章', '《xxx书》第8章', '《xxx书》第9章', '《xxx书》第10章', '《xxx书》第11章', '《xxx书》第12章', '《xxx书》第13章', '《xxx书》第14章', '《xxx书》第15章', '《xxx书》第16章', '《xxx书》第17章', '《xxx书》第18章', '《xxx书》第19章', '《xxx书》第20章']
>
> === 测试 繁体中文数字带书名章节 ===  
> 原始顺序:  
> ['《xxx书》第貳章', '《xxx书》第拾章', '《xxx书》第拾壹章', '《xxx书》第陆章', '《xxx书》第拾柒章', '《xxx书》第拾捌章', '《xxx书》第拾玖章', '《xxx书》第壹章', '《xxx书》第柒章', '《xxx书》第叁章', '《xxx书》第肆章', '《xxx书》第拾肆章', '《xxx书》第玖章', '《xxx书》第拾叁章', '《xxx书》第貳拾章', '《xxx书》第拾貳章', '《xxx书》第拾伍章', '《xxx书》第捌章', '《xxx书》第拾陆章', '《xxx书》第伍章']
>
> 排序后:  
> ['《xxx书》第1章', '《xxx书》第2章', '《xxx书》第3章', '《xxx书》第4章', '《xxx书》第5章', '《xxx书》第6章', '《xxx书》第7章', '《xxx书》第8章', '《xxx书》第9章', '《xxx书》第10章', '《xxx书》第11章', '《xxx书》第12章', '《xxx书》第13章', '《xxx书》第14章', '《xxx书》第15章', '《xxx书》第16章', '《xxx书》第17章', '《xxx书》第18章', '《xxx书》第19章', '《xxx书》第20章']
>
> ====== 测试完成 ======
