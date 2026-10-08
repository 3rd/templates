local MINIMUM_NEOVIM = "0.11"

if vim.fn.has("nvim-" .. MINIMUM_NEOVIM) == 0 then
  error(("nvim-plugin requires Neovim %s or newer"):format(MINIMUM_NEOVIM), 0)
end

---@class NvimPluginOptions
---@field greeting? string Text placed before the recipient's name.

---@class NvimPluginConfig
---@field greeting string Text placed before the recipient's name.

local M = {}

---@type NvimPluginConfig
local DEFAULT_OPTIONS = {
  greeting = "Hello",
}

---@type NvimPluginConfig
local activeOptions = vim.deepcopy(DEFAULT_OPTIONS)

---@param options table
local validateOptions = function(options)
  vim.validate("options", options, "table")

  for name in pairs(options) do
    if DEFAULT_OPTIONS[name] == nil then
      error(("nvim-plugin: unknown option %s"):format(vim.inspect(name)), 3)
    end
  end

  vim.validate("options.greeting", options.greeting, "string", true)
end

---@param options? NvimPluginOptions
M.setup = function(options)
  if options == nil then
    options = {}
  end

  validateOptions(options)
  activeOptions = vim.tbl_deep_extend("force", {}, DEFAULT_OPTIONS, options)
end

---@param name? string
---@return string
M.greet = function(name)
  vim.validate("name", name, "string", true)

  return ("%s, %s!"):format(activeOptions.greeting, name or "Neovim")
end

return M
