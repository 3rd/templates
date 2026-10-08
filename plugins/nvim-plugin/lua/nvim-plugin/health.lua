local M = {}

M.check = function()
  vim.health.start("nvim-plugin")

  local loaded, pluginOrError = pcall(require, "nvim-plugin")

  if not loaded then
    vim.health.error("nvim-plugin could not be loaded", { tostring(pluginOrError) })
    return
  end

  local version = vim.version()
  local message = ("Neovim %d.%d.%d is supported"):format(
    version.major,
    version.minor,
    version.patch
  )

  vim.health.ok(message)
end

return M
