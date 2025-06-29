package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var exampleSubCommand = &cobra.Command{
	Use:   "example-subcommand",
	Short: "Example subcommand",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Hello, world!")
	},
}

func init() {
	exampleCommand := &cobra.Command{Use: "example",
		Short: "Example command",
	}

	exampleSubCommand.Flags().BoolP("exampleFlag", "e", false, "Sample flag")
	exampleCommand.AddCommand(exampleSubCommand)

	rootCmd.AddCommand(exampleCommand)
}
