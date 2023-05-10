// These are a run-length and offset encoded representation of the
// >0xffff code points that are a valid part of identifiers. The
// offset starts at 0x10000, and each pair of numbers represents an
// offset to the next range, and then a size of the range.
import astralIdentifierCodes from "./generated/astralIdentifierCodes.js"
import astralIdentifierStartCodes from "./generated/astralIdentifierStartCodes.js"
// Big ugly regular expressions that match characters in the
// whitespace, identifier, and identifier-start categories. These
// are only applied when a character is found to actually have a
// code point above 128.
import nonASCIIidentifierChars from "./generated/nonASCIIidentifierChars.js"
import nonASCIIidentifierStartChars from "./generated/nonASCIIidentifierStartChars.js"

// Reserved word lists for various dialects of the language

export const reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
}

// And the keywords

const ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this"

export const keywords = {
  5: ecma5AndLessKeywords,
  "5module": ecma5AndLessKeywords + " export import",
  6: ecma5AndLessKeywords + " const class extends export import super"
}

export const keywordRelationalOperator = /^in(stanceof)?$/

// ## Character categories

/**
 * 除了 ASCLL 字符之外，可以做标识符首字符的字符的集合的正则表达。
 */
const nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]")
/**
 * 除了 ASCLL 字符之外，可以在标识符字符串里出现的字符的集合的正则表达。
 */
const nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]")

/**
 * This has a complexity linear to the value of the code. The assumption is
 * that looking up astral identifier characters is rare.
 * 码点(code)是否在数组里面。
 * @param {number} code 码点
 * @param {number[]} set 繁星点点的(astral)数组（没错就是这么文艺），数组里面存储的都是逐步偏移量，
 * 数学上来看是一段不连续的（断断续续的）一维空间。
 * @returns {boolean}
 */
function isInAstralSet(code, set) {
  let pos = 0x10000
  for (let i = 0; i < set.length; i += 2) {
    pos += set[i]
    if (pos > code) return false
    pos += set[i + 1]
    if (pos >= code) return true
  }
  return false;
  /**
   * 图形化解释一下这个函数的作用：
   *  ...false, [0, ..., 11](true), ...false, [2, ..., 25](true)，每个偏移量都是相对于前驱偏移的。
   */
}

/**
 * Test whether a given character code starts an identifier.
 * @param {number} code 码点
 * @param {boolean} astral 是否属于繁星字符集
 * @returns {boolean}
 */
export function isIdentifierStart(code, astral) {
  if (code < 65) return code === 36 // $
  if (code < 91) return true // A-Z
  if (code < 97) return code === 95 // _
  if (code < 123) return true // a-z
  if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code))
  if (astral === false) return false
  return isInAstralSet(code, astralIdentifierStartCodes) // 再检查一遍？
}

/**
 * Test whether a given character is part of an identifier.
 * @param {number} code 码点
 * @param {boolean} astral 否属于繁星字符集
 * @returns {boolean}
 */
export function isIdentifierChar(code, astral) {
  if (code < 48) return code === 36
  if (code < 58) return true
  if (code < 65) return false
  if (code < 91) return true
  if (code < 97) return code === 95
  if (code < 123) return true
  if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code))
  if (astral === false) return false
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
}
