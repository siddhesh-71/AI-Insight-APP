# Getting Your Hugging Face API Key

## What is Hugging Face?

Hugging Face is a leading AI platform that provides access to thousands of pre-trained machine learning models. This application uses Hugging Face's free inference API to generate intelligent insights from your data.

## How to Get Your FREE API Key

### Step 1: Create an Account
1. Go to [Hugging Face](https://huggingface.co/)
2. Click "Sign Up" (top right corner)
3. Create a free account using:
   - Email address
   - Google account
   - GitHub account

### Step 2: Generate API Token
1. Once logged in, click your profile picture (top right)
2. Select "Settings" from the dropdown
3. Click "Access Tokens" in the left sidebar
4. Click "New token" button
5. Give it a name (e.g., "Insights App")
6. Select "Read" permission (default)
7. Click "Generate token"
8. **Important**: Copy the token immediately - you won't see it again!

### Step 3: Use in the Application
1. Start the application
2. Paste your API key in the "Hugging Face API Configuration" section
3. Click "Set API Key"
4. You're ready to generate AI insights! 🎉

## API Key Format

Your API key will look like this:
```
hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

It always starts with `hf_` followed by random characters.

## Important Notes

✅ **FREE**: The API is completely free for reasonable usage
✅ **Safe**: Your key is only stored in your browser session
✅ **Private**: Your data is not shared with Hugging Face
⚠️ **Keep it secret**: Don't share your API key publicly
⚠️ **Rate limits**: Free tier has usage limits (usually sufficient for testing)

## Troubleshooting

**"Invalid API key" error**
- Make sure you copied the entire key (starts with `hf_`)
- Check for extra spaces at the beginning or end
- Verify the token hasn't been revoked

**"Rate limit exceeded" error**
- You've made too many requests
- Wait a few minutes and try again
- Consider upgrading to Hugging Face Pro (paid)

**"Model loading error"**
- Check your internet connection
- The AI model may be temporarily unavailable
- Try again in a few moments

## Alternative: Environment Variable

Advanced users can set the API key as an environment variable:

**Windows:**
```cmd
set HUGGINGFACE_API_KEY=hf_your_key_here
```

**Mac/Linux:**
```bash
export HUGGINGFACE_API_KEY=hf_your_key_here
```

Or create a `.env` file in the `backend` folder:
```
HUGGINGFACE_API_KEY=hf_your_key_here
```

## Need Help?

- [Hugging Face Documentation](https://huggingface.co/docs/hub/security-tokens)
- [Hugging Face Community Forum](https://discuss.huggingface.co/)

---

**Ready to analyze your data with AI? Get your key and start exploring! 🚀**
