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
