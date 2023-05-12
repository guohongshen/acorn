// ## Token types

// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// The `startsExpr` property is used to check if the token ends a
// `yield` expression. It is set on all token types that either can
// directly start an expression (like a quotation mark) or can
// continue an expression (like the body of a string).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.

/**
 * 词法单元(token)的类型。
 */
export class TokenType {
  /**
   * ？？？
   */
  label = null;
  /**
   * 如果是关键字类型，此字段存储关键字的字符串
   */
  keyword = null;
  /**
   * The beforeExpr property is used to disambiguate between regular expressions
   * and divisions.  It is set on all token types that can be followed by an 
   * expression (thus, a slash after them would be a regular expression).
   * ？？？
   */
  beforeExpr = false;
  /**
   * The startsExpr property is used to check if the token ends a yield expression.
   * It is set on all token types that either can directly start an expression (like
   * a quotation mark) or can continue an expression (like the body of a string).
   * ？？？
   */
  startsExpr = false;
  /**
   * isLoop marks a keyword as starting a loop, which is important to know when 
   * parsing a label, in order to allow or disallow continue jumps to that label.
   * ？？？
   */
  isLoop = false;
  /**
   * Marks all of `=`, `+=`, `-=` etcetera, which act as binary operators
   * with a very low precedence, that should result AssignmentExpression nodes.
   * 是否是赋值类二元运算符(=, +=, -= 等)
   */
  isAssign = false;
  /**
   * 是否是一元前置运算符，如 ++ 等
   */
  prefix = false;
  /**
   * 是否是一元后置运算符，如 ++ 等
   */
  postfix = false;
  /**
   * binop: binary operator (precedence).
   * 如果不为 null，则表示本 token 是一个二元运算符，并且它的值表示运算符的优先级。
   */
  binop = null;
  /**
   * ？？？
   */
  updateContext = null;
  constructor(label, conf = {}) {
    this.label = label
    this.keyword = conf.keyword
    this.beforeExpr = !!conf.beforeExpr
    this.startsExpr = !!conf.startsExpr
    this.isLoop = !!conf.isLoop
    this.isAssign = !!conf.isAssign
    this.prefix = !!conf.prefix
    this.postfix = !!conf.postfix
    this.binop = conf.binop || null
    this.updateContext = null
  }
}

/**
 * Used to present, specifies that this operator is a binary 
 * operator, and will refer to its precedence.
 * 构造二元操作符的 TokenType 实例。
 * @param {string} name 操作符字符串（正则表达）
 * @param {number} prec 操作符的优先级(precedence，简写 prec)
 * @returns 
 */
function binop(name, prec) {
  return new TokenType(name, {beforeExpr: true, binop: prec})
}

const beforeExpr = {beforeExpr: true};
const startsExpr = {startsExpr: true}

/**
 * Map keyword names to token types.
 */
export const keywords = {}

/**
 * Succinct definitions of keyword token types.
 * 根据 name 和 options 快速获取一个 TokenType 的实例。
 * @param {*} name 
 * @param {any} options 
 * @returns 
 */
function kw(name, options = {}) {
  options.keyword = name
  return keywords[name] = new TokenType(name, options)
}

export const types = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  /**
   * ？？？
   */
  privateId: new TokenType("privateId", startsExpr),
  eof: new TokenType("eof"),

  // Punctuation（标点符号） token types.
  /**
   * [
   */
  bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
  /**
   * ]
   */
  bracketR: new TokenType("]"),
  /**
   * {
   */
  braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
  /**
   * }
   */
  braceR: new TokenType("}"),
  /**
   * (
   */
  parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
  /**
   * )
   */
  parenR: new TokenType(")"),
  /**
   * ,
   */
  comma: new TokenType(",", beforeExpr),
  /**
   * ;
   */
  semi: new TokenType(";", beforeExpr),
  /**
   * :
   */
  colon: new TokenType(":", beforeExpr),
  /**
   * .
   */
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  questionDot: new TokenType("?."),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  invalidTemplate: new TokenType("invalidTemplate"),
  /**
   * ...
   */
  ellipsis: new TokenType("...", beforeExpr),
  /**
   * `
   */
  backQuote: new TokenType("`", startsExpr),
  /**
   * ${
   */
  dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

  /**
   * The following are operators. These carry several kinds of properties 
   * to help the parser use them properly (the presence of these properties
   * is what categorizes them as operators).
   */

  /**
   * =
   */
  eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
  /**
   * _= ???
   */
  assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
  /**
   * increase or decrease.
   * ++/--
   */
  incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
  /**
   * !/~
   */
  prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
  /**
   * ||
   */
  logicalOR: binop("||", 1),
  /**
   * &&
   */
  logicalAND: binop("&&", 2),
  /**
   * |
   */
  bitwiseOR: binop("|", 3),
  /**
   * ^
   */
  bitwiseXOR: binop("^", 4),
  /**
   * &
   */
  bitwiseAND: binop("&", 5),
  /**
   * ==, !=, ===, !==
   */
  equality: binop("==/!=/===/!==", 6),
  /**
   * <, >, <=, >=
   */
  relational: binop("</>/<=/>=", 7),
  /**
   * 移位运算符
   * `<<`: 有符号左移，低位补 0，高位丢弃；
   * `>>`: 有符号右移，高位补符号位，低位丢弃；
   * `>>>`: 无符号右移动。
   */
  bitShift: binop("<</>>/>>>", 8),
  /**
   * plus or minus
   * +, -
   */
  plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
  /**
   * 模运算
   * %
   */
  modulo: binop("%", 10),
  /**
   * 星
   * *
   */
  star: binop("*", 10),
  /**
   * 反斜杠
   * /
   */
  slash: binop("/", 10),
  /**
   * 幂运算符
   * **
   */
  starstar: new TokenType("**", {beforeExpr: true}),
  /**
   * 空值合并操作符
   */
  coalesce: binop("??", 1),

  // Keyword token types.
  _break: kw("break"),
  _case: kw("case", beforeExpr),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default", beforeExpr),
  _do: kw("do", {isLoop: true, beforeExpr: true}),
  _else: kw("else", beforeExpr),
  _finally: kw("finally"),
  _for: kw("for", {isLoop: true}),
  _function: kw("function", startsExpr),
  _if: kw("if"),
  _return: kw("return", beforeExpr),
  _switch: kw("switch"),
  _throw: kw("throw", beforeExpr),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while", {isLoop: true}),
  _with: kw("with"),
  _new: kw("new", {beforeExpr: true, startsExpr: true}),
  _this: kw("this", startsExpr),
  _super: kw("super", startsExpr),
  _class: kw("class", startsExpr),
  _extends: kw("extends", beforeExpr),
  _export: kw("export"),
  _import: kw("import", startsExpr),
  _null: kw("null", startsExpr),
  _true: kw("true", startsExpr),
  _false: kw("false", startsExpr),
  _in: kw("in", {beforeExpr: true, binop: 7}),
  _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
  _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
  _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
  _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
}
