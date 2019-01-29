import styled from 'styled-components'

export default styled.div`
  position: absolute;
  border: 1px solid #eb5648;
  .square {
    position: absolute;
    width: 7px;
    height: 7px;
    background: white;
    border: 1px solid #eb5648;
    border-radius: 1px;
  }
  .resizable-handler {
    position: absolute;
    width: 14px;
    height: 14px;
    cursor: pointer;
    z-index: 1;
    &.tl,
    &.t,
    &.tr {
      top: -7px;
    }
    &.tl,
    &.l,
    &.bl {
      left: -7px;
    }
    &.bl,
    &.b,
    &.br {
      bottom: -7px;
    }
    &.br,
    &.r,
    &.tr {
      right: -7px;
    }
    &.l,
    &.r {
      margin-top: -7px;
    }
    &.t,
    &.b {
      margin-left: -7px;
    }
  }
  .rotate {
    position: absolute;
    cursor: pointer;
    left: 50%;
    top: -26px;
    transform: translateX(-50%);
    & i {
      font-size: 18px;
      display: inline-block;
      width: 1em;
      height: 1em;
      background-size: 1em 1em;
      background-repeat: no-repeat;
      background-position: center center;
      background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxwYXRoIGlkPSJhIiBkPSJNOC4zIDUuNEw4IC40bDMuMiAyLjEgMS43IDF6Ii8+PG1hc2sgaWQ9ImIiIHg9IjAiIHk9IjAiIHdpZHRoPSI0LjkiIGhlaWdodD0iNC45IiBmaWxsPSIjZmZmIj48dXNlIHhsaW5rOmhyZWY9IiNhIi8+PC9tYXNrPjwvZGVmcz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxIDEpIiBzdHJva2U9IiNGNTVENTQiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0iTTExIDkuMkE2IDYgMCAwIDEgMCA2YTYgNiAwIDAgMSAxMC43LTMuOCIvPjx1c2UgbWFzaz0idXJsKCNiKSIgc3Ryb2tlLXdpZHRoPSIyIiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAyMSAwKSIgeGxpbms6aHJlZj0iI2EiLz48L2c+PC9zdmc+Cg==");
    }
  }
  .t,
  .tl,
  .tr {
    top: -3px;
  }
  .b,
  .bl,
  .br {
    bottom: -3px;
  }
  .r,
  .tr,
  .br {
    right: -3px;
  }
  .tl,
  .l,
  .bl {
    left: -3px;
  }
  .l,
  .r {
    top: 50%;
    margin-top: -3px;
  }
  .t,
  .b {
    left: 50%;
    margin-left: -3px;
  }
  `
