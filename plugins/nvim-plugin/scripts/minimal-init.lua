local scriptPath = debug.getinfo(1, "S").source:sub(2)
local projectRoot = vim.fn.fnamemodify(scriptPath, ":p:h:h")
local miniTestPath = vim.env.MINI_TEST_PATH

if miniTestPath == nil or miniTestPath == "" then
  miniTestPath = projectRoot .. "/.deps/mini.test"
end

if vim.fn.isdirectory(miniTestPath) == 0 then
  error("mini.test was not found; run `make deps`")
end

vim.opt.runtimepath:prepend(miniTestPath)
vim.opt.runtimepath:append(projectRoot)
vim.opt.shadafile = "NONE"
vim.opt.swapfile = false

require("mini.test").setup({
  collect = {
    emulate_busted = false,
    find_files = function()
      return vim.fn.globpath(projectRoot .. "/tests", "**/test_*.lua", true, true)
    end,
  },
})
