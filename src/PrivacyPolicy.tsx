import React from 'react';
import { Typography, Container, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const logoUrl = 'https://metal-news-image.s3.us-east-1.amazonaws.com/imgMetalNewsLogoN3.gif';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5', 
      minHeight: '100vh', 
      paddingBottom: 4,
      margin: 0,
      padding: 0 
    }}>
      <Box sx={{ 
        position: 'sticky',
        top: 0,
        bgcolor: '#191970',
        height: '65px',
        zIndex: 1000,
        margin: 0,
        padding: 0
      }}>
        <Container maxWidth="lg" sx={{ margin: 0, padding: 0 }}>
          <Box 
            component="img"
            src={logoUrl}
            alt="Metal News Logo"
            sx={{ 
              height: '65px',
              bgcolor: 'white',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          />
        </Container>
      </Box>

      <Container maxWidth="md">
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            プライバシーポリシー
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
            METALNEWS ONLINE LLC（以下、当社）は、ユーザーからお預かりしている個人情報を保護するため、細心の注意を払っております。以下に、当社が運営するインターネット上の媒体すべてにおける個人情報の取り扱いについてご説明いたします。
<br></br><br></br>
<pre>   1) 個人情報の利用目的について</pre>
<pre>   2) 第三者への開示・提供について</pre>
<pre>   3) 個人情報の管理について</pre>
<pre>   4) 個人情報の訂正、利用停止等について</pre>
<pre>   5) CookieやWebビーコン、IPアドレスの利用について</pre>
<pre>   6) プライバシーポリシーの改定について</pre>
<pre>   7) お問い合わせ先</pre>

<br></br>
<strong>1.個人情報の利用目的について</strong><br></br>
当社は、個人情報を次の目的で利用するものとし、これら以外の目的で個人情報を利用する場合には、ユーザーから個別に同意を得るものとします。
<br></br>
メールマガジン
ユーザーが受信を希望したメールマガジン配信のため
ユーザーに有益と思われる、当社および広告主の商品

<br></br>・サービス・キャンペーンに関するご案内のため
情報やサービス（資料請求・体験レッスン・メール相談）
ユーザーが入力した個人情報は、資料、体験レッスン、メール相談などの情報やサービスを提供する企業／団体に自動的に送信されます。各企業／団体は、特別な記載とそれに対するユーザーの同意がない限り、下記以外の目的では利用しません。

お申し込みの確認および、希望された資料の送付、体験レッスンなどのサービスの提供のため
お問い合わせの対応など関連するアフターサービスのため
関連商品・サービス・キャンペーン情報のご案内のため
統計情報の作成のため
アンケート
当社および当社以外の企業／団体の商品やサービスに関するご意見等をおうかがいし、今後の参考とするため
その他
ユーザーが希望した、当社が提供するサービスを提供するため
当社がユーザーに何らかの連絡をするため
プレゼント、謝礼などをお送りするため
当社サイトにおけるユーザー統計情報作成の参考とするため（広告主、その他の第三者に当社のサービスを説明する際、またその他の合法的な目的のために本情報を提供することがあります。ただし、統計情報には、個々のユーザーを識別できる情報は含まれません）

<br></br><br></br>
<strong>2.第三者への開示・提供について</strong><br></br>
当社は、以下のいずれかに該当する場合を除き、個人情報を第三者へ開示・提供いたしません。

<ul> 
<li>ユーザーの同意がある場合</li>
<li>上記の利用目的の達成に必要な範囲内において個人情報の取り扱いの全部または一部を委託する場合</li>
<li>当社およびユーザーの権利、財産やサービス等を保護するために必要と認められる場合</li>
<li>ユーザー個人を特定することができない状態で開示する場合</li>
<li>法令等に基づく場合</li>
</ul> 
<br></br><br></br>
<strong>3.個人情報の管理について</strong><br></br>
当社では、個人情報の管理責任者の下、安全な環境下にて厳重に管理いたします。

BBS（掲示板）の開示情報について
BBS（掲示板）内でユーザーがご自身の判断で開示した情報（氏名、メールアドレスなど）は、公開情報となりますので、十分ご注意下さい。当社は、ユーザーが自ら個人情報を開示したことで生じたいかなる損害についても、一切責任を負いかねますので、あらかじめご了承下さい。

<br></br><br></br>
<strong>4.個人情報の訂正、利用停止等について</strong><br></br>
当社サイト内において、ユーザーが登録された個人情報について、ユーザーが、訂正、利用停止等を要請される場合は、所定の手続きに則り、速やかに対応いたします。これらに関する要請は、お問合せ窓口からご請求下さい。個人情報漏洩防止の観点から、当該ご請求がユーザーご本人によるものであることが確認できた場合に限り、合理的な期間内に、ユーザーの個人情報を訂正、利用停止等いたします。

メールマガジンの解除について
メールマガジンは、ユーザーご自身で解除いただくことができます。ログイン後、アカウント設定より解除してください。

<br></br><br></br>
<strong>5.CookieやWebビーコン、IPアドレスの利用について</strong>
Cookieの使用
当社サイトでは、ユーザーの操作性と利便性のため、一部のページでCookieを利用しています。Cookieの受け入れ可否やCookieの削除は、 Webブラウザで行うことができますが、当社のサービスをより一層活用するために、クッキーを受け付ける設定を推奨いたします。

Webビーコン
当社からお送りしているHTML形式のメールマガジンにおいて、利用状況に関する集計的な統計を編集するため、Webビーコンを使用しています。Web ビーコンの使用で入手した情報を統計的に処理した集約情報を公表することがありますが、個々のユーザーを識別できる情報は含みません。

IPアドレスの使用
当社は、ログに記録されたユーザーのIPアドレスを、主として、サーバーで発生した問題の原因を突き止め解決するため、そしてサイトを管理するために利用します。

<br></br><br></br>
<strong>6.プライバシーポリシーの改定について</strong><br></br>
当ポリシーに重要な変更がある場合には、当ポリシー上で告知いたします。

<br></br><br></br>
<strong>7.お問い合わせ先</strong><br></br>
個人情報保護に関するお問い合わせは、下記お問い合わせフォームのみにて承っております。あらかじめご了承下さい。
          </Typography>
        </Paper>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 3, 
          mb: 3 
        }}>
          <Typography 
            component="span" 
            sx={{ 
              color: '#191970',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
            onClick={() => navigate('/')}
          >
            ホームに戻る
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
