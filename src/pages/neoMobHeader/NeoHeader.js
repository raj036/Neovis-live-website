import styles from "./neoHeader.module.css";

const NeoHeader = () => {
  return (
    <>
      <main>
        <div className={styles.frameParent}>
          <div className={styles.frameWrapper}>
            <div className={styles.frameGroup}>
              <div className={styles.frameContainer}>
                <div className={styles.frameDiv}>
                  <div className={styles.requestNowButtonWrapper}>
                    <img
                      className={styles.requestNowButton}
                      loading="lazy"
                      alt=""
                      src="/static/neoMobScan/vector.svg"
                    />
                  </div>
                  <div className={styles.whatIsDplWrapper}>
                    <a className={styles.whatIsDpl}>Welcome</a>
                  </div>
                </div>
              </div>
              <div className={styles.fullLogo1Wrapper}>
                <img
                  className={styles.fullLogo1}
                  loading="lazy"
                  alt=""
                  src="/static/neoMobScan/full-logo-1@2x.png"
                />
              </div>
              <div>
                <div className={styles.rectangleParent}>
                  <div className={styles.frameChild} />
                  <a className={styles.whatIsDpl1}>{`Property : XYZ 52 `}</a>
                  <a className={styles.whatIsDpl2}>Room No : BK505</a>
                </div>
              </div>
            </div>
          </div>
          <img
            className={styles.frameItem}
            loading="lazy"
            alt=""
            src="/static/neoMobScan/rectangle-17.svg"
          />
        </div>
      </main>
    </>
  );
};

export default NeoHeader;
