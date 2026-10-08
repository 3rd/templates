if vim.g.loaded_nvim_plugin then
  return
end

vim.g.loaded_nvim_plugin = true

vim.api.nvim_create_user_command("NvimPluginGreet", function(command)
  local name = command.args ~= "" and command.args or nil
  local message = require("nvim-plugin").greet(name)

  vim.api.nvim_echo({ { message } }, false, {})
end, {
  desc = "Greet someone with nvim-plugin",
  nargs = "?",
})
