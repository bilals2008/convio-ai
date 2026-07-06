# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# code-style
See [code-style/taste.md](code-style/taste.md)
# design
- Keep dashboard stats cards compact with a horizontal row layout (icon, label+value, change badge in one line); use p-3.5, size-9 icons, text-lg for values, and small change badges. Confidence: 0.65

# security
- Mask sensitive config fields (tokens/secrets) in GET responses by showing only "x" + last 4 characters. Generate API keys using crypto.randomUUID(). Never log sensitive config fields. Confidence: 0.75
