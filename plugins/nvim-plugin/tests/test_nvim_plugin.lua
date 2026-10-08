local newSet = MiniTest.new_set
local expectEqual = MiniTest.expect.equality
local child = MiniTest.new_child_neovim()

local T = newSet({
  hooks = {
    pre_case = function()
      child.restart({ "-u", "scripts/minimal-init.lua" })
    end,
    post_once = child.stop,
  },
})

local expectSetupFailure = function(luaCode, messagePart)
  local result = child.lua(luaCode)

  expectEqual(result[1], false)
  expectEqual(result[2]:find(messagePart, 1, true) ~= nil, true)
end

T["runtime entrypoint"] = newSet()

T["runtime entrypoint"]["registers the command without loading the module"] = function()
  expectEqual(child.fn.exists(":NvimPluginGreet"), 2)
  expectEqual(child.lua_get('package.loaded["nvim-plugin"] == nil'), true)
end

T["runtime entrypoint"]["loads the module only when the command runs"] = function()
  local result = child.api.nvim_exec2("NvimPluginGreet", { output = true })

  expectEqual(result.output, "Hello, Neovim!")
  expectEqual(child.lua_get('package.loaded["nvim-plugin"] ~= nil'), true)
end

T["public API"] = newSet()

T["public API"]["uses defaults without setup"] = function()
  expectEqual(child.lua_get('require("nvim-plugin").greet()'), "Hello, Neovim!")
end

T["public API"]["rejects invalid names"] = function()
  local result = child.lua([[
    local loaded, errorMessage = pcall(require("nvim-plugin").greet, 1)
    return { loaded, tostring(errorMessage) }
  ]])

  expectEqual(result[1], false)
  expectEqual(result[2]:find("name", 1, true) ~= nil, true)
end

T["public API"]["applies configuration to the API and command"] = function()
  child.lua('require("nvim-plugin").setup({ greeting = "Welcome" })')

  expectEqual(child.lua_get('require("nvim-plugin").greet("Ada")'), "Welcome, Ada!")

  local result = child.api.nvim_exec2("NvimPluginGreet Ada", { output = true })
  expectEqual(result.output, "Welcome, Ada!")
end

T["public API"]["resets omitted options to defaults on each setup call"] = function()
  child.lua([[
    local plugin = require("nvim-plugin")
    plugin.setup({ greeting = "Welcome" })
    plugin.setup()
  ]])

  expectEqual(child.lua_get('require("nvim-plugin").greet("Ada")'), "Hello, Ada!")
end

T["public API"]["rejects invalid and unknown options"] = function()
  expectSetupFailure(
    [[
    local loaded, errorMessage = pcall(require("nvim-plugin").setup, "invalid")
    return { loaded, tostring(errorMessage) }
  ]],
    "table"
  )

  expectSetupFailure(
    [[
    local loaded, errorMessage = pcall(require("nvim-plugin").setup, { greeting = 1 })
    return { loaded, tostring(errorMessage) }
  ]],
    "options.greeting"
  )

  expectSetupFailure(
    [[
    local loaded, errorMessage = pcall(require("nvim-plugin").setup, { greting = "Hello" })
    return { loaded, tostring(errorMessage) }
  ]],
    "unknown option"
  )
end

T["integration"] = newSet()

T["integration"]["reports a healthy supported version"] = function()
  child.cmd("checkhealth nvim-plugin")

  local lines = child.api.nvim_buf_get_lines(0, 0, -1, false)
  local report = table.concat(lines, "\n")

  expectEqual(report:find("nvim-plugin", 1, true) ~= nil, true)
  expectEqual(report:find("is supported", 1, true) ~= nil, true)
end

T["integration"]["opens the generated help"] = function()
  child.cmd("help nvim-plugin")

  expectEqual(child.bo.filetype, "help")
  expectEqual(child.fn.expand("%:t"), "nvim-plugin.txt")
end

return T
