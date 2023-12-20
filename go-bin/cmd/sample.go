package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var exampleCommand = &cobra.Command{
	Use:   "example",
	Short: "Sample command",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Hello, world!")
	},
}

func init() {
	cmd := &cobra.Command{Use: "prefix",
		Short: "Sample prefix",
	}

	exampleCommand.Flags().BoolP("exampleFlag", "e", false, "Sample flag")
	cmd.AddCommand(exampleCommand)

	rootCmd.AddCommand(cmd)
}
